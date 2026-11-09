# RPM Rent — Technical Audit

Дата аудита: 2026-08-20  
Репозиторий: `C:\Users\wthtw\OneDrive\Documents\ChatGPT\RPM Rent`  
HEAD на момент аудита: `fc810b7` (`main`, `origin/main`)  
Ограничение: аудит и архитектурные рекомендации; функциональный код, схема БД и зависимости не изменялись.

Обозначения:

- **FACT** — подтверждено кодом, конфигурацией, историей Git или результатом команды.
- **INFERENCE** — вывод из подтверждённых фактов.
- **UNKNOWN** — в репозитории нет достаточных данных.
- Оценки сложности: `XS` — несколько часов, `S` — небольшая задача, `M` — средняя, `L` — крупная, `XL` — отдельный крупный этап.

## 1. Executive Summary

**FACT.** RPM Rent — production-oriented monolith на Next.js App Router с серверными страницами, Server Actions для админки и одним публичным JSON API для заявок. Основное хранилище в production — PostgreSQL через Prisma; предусмотрен development-only JSON `FileStore`. Изображения обслуживаются через локальный volume и, при наличии конфигурации, Supabase Storage.

**FACT.** Автомобиль сейчас моделируется как одна запись `Car` (`prisma/schema.prisma:11-54`) с дочерними `CarImage` (`prisma/schema.prisma:56-65`). В модели нет marketplace, listing, внешнего ID, аккаунта площадки, snapshot, discrepancy или audit log.

**FACT.** В коде не найдено Avito/Auto.ru/Drom API, фоновых worker/queue/scheduler, connector layer или механизма recurring monitoring. Внешние HTTP-интеграции ограничены Supabase Storage, Yandex Disk media proxy и необязательным CRM webhook (`src/lib/supabase-storage.ts:21-56`, `src/app/api/media/yandex/route.ts:7-20`, `src/app/api/bookings/route.ts:29-30`).

**INFERENCE.** Текущая модель пригодна для master-карточки сайта и MVP «показать расхождения», но напрямую расширять её публикациями на нескольких площадках нельзя: это смешает автомобиль и публикацию, усложнит историю значений и приведёт к условной логике в `Car`.

**Final Verdict: C — REFACTOR REQUIRED.** Новый модуль нельзя безопасно строить как набор полей в `Car` и ad hoc запросов из страниц. Нужен ограниченный доменный рефакторинг вокруг сущностей публикации, нормализованного snapshot и отдельного comparison service. Полный redesign не требуется.

Главные риски перед Marketplace Monitoring:

1. Нет связи `Car ↔ MarketplaceListing`, поэтому невозможно надёжно различать один автомобиль и его внешние публикации.
2. Нет фонового выполнения, блокировок, retry и истории запусков; периодический мониторинг будет либо ручным, либо ненадёжным процессом внутри web-request.
3. Авторизация — один общий admin account без ролей и audit trail; manual/auto sync без дополнительной модели прав и журналирования небезопасны.

Рекомендуемый первый шаг: зафиксировать master-модель RPM и минимальный read-only контракт `MarketplaceListing`/`MarketplaceSnapshot`, затем сделать Avito connector только для мониторинга без записи обратно.

## 2. Current Technology Stack

| Область | Фактическое состояние | Доказательство |
|---|---|---|
| Frontend/backend | Next.js 16.3 App Router, React 19.2, TypeScript 6 strict | `package.json`, `tsconfig.json`, `src/app` |
| Runtime | Node.js 22 в Docker | `Dockerfile:1`, `README.md` |
| ORM/DB | Prisma 7.9 + `@prisma/adapter-pg`, PostgreSQL 17 в compose | `package.json`, `src/lib/data/prisma-store.ts:1-33`, `compose.production.yml` |
| Validation | Zod 4; server-side schemas | `src/lib/validation.ts:1-169` |
| Auth | HMAC cookie session, scrypt password hash, один email/password | `src/lib/auth.ts:5-57`, `src/app/admin/login/actions.ts:12-25` |
| API | Route Handlers: bookings, media; admin mutations mostly Server Actions | `src/app/api`, `src/app/admin/actions.ts:1-132` |
| Storage | PostgreSQL for production data; JSON file fallback for dev; local media volume and optional Supabase Storage | `src/lib/data/index.ts:7-21`, `src/lib/local-media.ts:23-52`, `src/lib/supabase-storage.ts` |
| Jobs/queues | Не обнаружены | `rg` по `src`, `scripts`, `deploy`: нет worker/queue/scheduler implementation |
| Tests | Vitest; unit/component/route tests | `vitest.config.ts`, 43 test files по инвентаризации |
| CI | Не обнаружен `.github`; CI provider configuration отсутствует в репозитории | inventory: `NO .github directory` |
| Deployment | Docker Compose + Caddy; standalone Next runner; systemd backup timer | `Dockerfile`, `compose.production.yml`, `deploy/*` |
| Logging | `console.error/info`; нет structured logger/error tracker | `src/app/api/bookings/route.ts:37`, `src/lib/data/index.ts:18` |

## 3. Repository Structure

**FACT.** На момент аудита: 142 TypeScript/TSX-файла, 43 test-файла, 6 API route files, 7 Prisma migration directories, 11 admin page files.

Основные зоны:

```text
src/app/                 Next routes, pages, Server Actions, API handlers
src/components/          public UI and admin UI components
src/lib/domain/           booking/date/status domain logic
src/lib/data/             DataStore interface, FileStore, PrismaStore
src/lib/                 auth, validation, rate limit, storage, import helpers
src/data/                 seed and imported car data
prisma/                   schema and migrations
scripts/                  seed/import/hash/env utilities
deploy/                   Docker/Caddy/backup/bootstrap scripts
public/images/            checked-in public car media
docs/                     admin guide and historical plans/specs
```

**FACT.** В рабочем дереве были предварительные пользовательские изменения и артефакты (`booking-form`, `file-store`, `prisma-store`, `FIXES_SUMMARY.md`, `QA_AUDIT_REPORT.md`, `output/` и другие). Они не были изменены. Новый отчёт — единственный файл, созданный этим аудитом.

**FACT.** `AGENTS.md` требует перед изменениями читать актуальные документы Next из `node_modules/next/dist/docs/`; в рамках аудита код не менялся, поэтому правило не обходилось.

**FACT.** `CLAUDE.md` содержит только 11 байт и не задаёт дополнительных правил.

## 4. Current Architecture

Фактическая схема:

```text
Browser
  ├─ Server-rendered public pages
  ├─ client booking form ──POST /api/bookings
  └─ authenticated admin pages
       ├─ Server Actions /admin/actions.ts
       └─ media Route Handlers
              ↓
         getStore() / DataStore
          ├─ PrismaStore ── Prisma ── PostgreSQL
          └─ FileStore   ── .data/db.json (dev fallback)
              ↓
         Car, CarImage, Booking, Service, Faq, Location
```

**FACT.** `getStore()` выбирает Prisma только если `DATABASE_URL` начинается с `postgres`; в production при отсутствующем/невалидном DB URL fallback запрещён (`src/lib/data/index.ts:7-21`).

**FACT.** Публичные страницы получают cars напрямую через `getStore()` (`src/app/page.tsx:47-48`, `src/app/cars/page.tsx:16-17`, `src/app/cars/[slug]/page.tsx:32-33`). Отдельного public catalog API нет.

**FACT.** Админские page components читают тот же `DataStore`, но с `includeHidden: true` (`src/app/admin/(panel)/cars/page.tsx:13-16`, `src/app/admin/(panel)/page.tsx:14-17`). Изменения автомобилей идут через `saveCarAction` → Zod → `store.saveCar` (`src/app/admin/actions.ts:29-61`).

**INFERENCE.** Бизнес-логика частично вынесена в domain helpers и store, но orchestration админских действий и storage cleanup находится в одном Server Action module. Это достаточно для текущего CRUD, но не для длительных marketplace workflows.

## 5. Data Flow

Публичный каталог:

```text
GET /cars or /cars/[slug]
  → page.tsx
  → getStore().getCars()/getCarBySlug()
  → PrismaStore/FileStore
  → Car + images sorted by sortOrder
  → CarCard/CarGallery/CarImportedDetails
```

Создание/изменение автомобиля:

```text
Admin form
  → Server Action saveCarAction
  → requireAdmin()
  → carAdminSchema.safeParse(FormData)
  → validate media references
  → DataStore.saveCar()
  → Prisma transaction: upsert Car, delete/recreate CarImage rows
  → revalidatePath('/', 'layout')
  → redirect back to editor
```

**FACT.** В Prisma `saveCar` одна transaction заменяет все `CarImage` rows и создаёт их заново в порядке массива (`src/lib/data/prisma-store.ts:145-190`).

**INFERENCE.** Такая замена удобна для текущего редактора порядка фото, но при появлении marketplace snapshots она не сохраняет diff изображения, внешний порядок или actor history.

Обработка изображений:

```text
AdminMediaUploader
  → POST /api/admin/media/sign-upload
  → local upload PUT /api/admin/media/local-upload
    или Supabase signed upload при включённом storage path
  → hidden form fields with media URLs
  → saveCarAction persists URLs in CarImage
  → /api/media/storage serves local/Supabase media
```

## 6. Car Domain Model

**FACT.** `Car` содержит: `id`, unique `slug`, brand/model/title, category/bodyType/vehicleClass, year, transmission, engine, horsepower, driveType, seats, public descriptions, `pricePerDay`, `oldPrice`, `deposit`, rental restrictions, insurance, JSON `features`/`rentalConditions`, availability/publication flags, demo/promotion flags, order, SEO, timestamps (`prisma/schema.prisma:11-54`).

**FACT.** `CarImage` содержит `carId`, URL, alt и `sortOrder`; индекс `(carId, sortOrder)` присутствует (`prisma/schema.prisma:56-65`). Первое изображение массива фактически используется как cover в UI (`src/components/admin/admin-media-uploader.tsx:189-190`).

**FACT.** Есть внутренний `Car.id` и public `slug`. VIN, госномер, inventory ID, marketplace ID и canonical external identity отсутствуют.

**FACT.** Есть `published`, `available`, но нет soft delete/archive; удаление автомобиля запрещено только если есть booking (`src/lib/data/prisma-store.ts:207-213`, `src/lib/data/file-store.ts:110-117`).

**FACT.** Цена и залог являются полями master `Car`; условия аренды распределены между scalar fields, `insurance`, `features`, `rentalConditions`.

Ответ на ключевой вопрос: **для одного автомобиля с несколькими внешними публикациями текущая модель не пригодна без расширения.** Она смешивает `vehicle/master card` и `site publication`. Текущий `Car` можно сохранить как master entity, но публикации должны стать отдельными сущностями:

```text
Car #15 (master)
  ├─ Site listing
  ├─ Avito listing
  ├─ Auto.ru listing
  └─ Drom listing
```

## 7. Admin Panel

**FACT.** Панель защищена layout-level `requireAdmin()` (`src/app/admin/(panel)/layout.tsx:6-8`). Разделы: Сегодня, Обращения, Календарь, Автопарк, Локации, Контент (`src/components/admin/admin-navigation.tsx:8-24`).

**FACT.** Навигация централизована в одном массиве items, поэтому новый read-only раздел можно добавить локально (`src/components/admin/admin-navigation.tsx:8-15`). UI уже имеет таблицы и responsive sidebar styles (`src/app/globals.css:627-641`).

**FACT.** Есть car editor с публикацией, availability, полями цены/залогов/характеристик, SEO и multiple media uploader (`src/components/admin/car-form.tsx:24-57`). Uploader поддерживает reorder и cover (`src/components/admin/admin-media-uploader.tsx:17-23`, `:176-203`).

**FACT.** Ролей и per-user permissions нет: auth payload содержит только email (`src/lib/auth.ts:16-19`, `:24-37`), а `requireAdmin` возвращает только `{ email }`.

**INFERENCE.** Для MVP dashboard «Car × Platform × status» текущая админка — подходящая оболочка (оценка 6/10): navigation/layout/table primitives уже есть, но отсутствуют query/read model для comparison и отдельные error/loading/refresh semantics сложного dashboard.

**Риск.** Manual Sync нельзя безопасно выпускать поверх текущей модели без actor/audit/permission semantics. Для read-only Monitoring это менее критично.

## 8. Database

**FACT.** Schema нормализована для текущего rental scope: `Car`, `CarImage`, `Booking`, `Service`, `Faq`, `Location`; relations и FK заданы с `CarImage ON DELETE CASCADE`, `Booking ON DELETE RESTRICT` (`prisma/schema.prisma:56-135`).

**FACT.** Есть unique для `Car.slug`, `Service.slug`, `Location.slug`, `Booking.idempotencyKey`; есть индексы изображений и booking period (`prisma/schema.prisma`, `prisma/migrations/20260809000000_domain_integrity/migration.sql`).

**FACT.** Booking имеет transaction + serializable isolation, idempotency и PostgreSQL exclusion constraint для активных пересекающихся периодов (`src/lib/data/prisma-store.ts:252-309`, migration `20260809000000_domain_integrity`).

**FACT.** Нет индексов или таблиц для marketplace identity, listing state, snapshots, runs, discrepancies, alerts, mapping или audit events.

**INFERENCE.** Для масштаба `50 × 5 × 100` обычная relational модель с отдельными listing/snapshot tables будет достаточна. Текущий Car JSON для `features`/`rentalConditions` не стоит превращать в generic EAV на старте: для сравнения нужны typed canonical fields, а площадочные payloads можно хранить как raw JSON snapshot.

**Database risks:**

- `CarImage` не имеет unique `(carId, sortOrder)` и отдельного `isPrimary`; primary выводится из порядка.
- Нет explicit soft delete, поэтому historical listing references потребуют запрета удаления или archive state.
- `Car.updatedAt` не даёт field-level change history.
- `Car` и `Booking` покрыты значимыми constraints, но нет transaction/audit boundary для будущих sync operations.

## 9. Backend

Сильные стороны:

- `DataStore` interface отделяет page code от Prisma/FileStore (`src/lib/data/store.ts:4-24`).
- Домен бронирования и статусы выделены в `src/lib/domain/*`.
- Zod проверяет server input и запрещает лишние keys (`src/lib/validation.ts:30-61`, `:85-131`).
- Prisma car save обёрнут transaction; booking защищён serializable/exclusion constraint.

Ограничения для marketplace:

- `src/app/admin/actions.ts` совмещает auth, parsing, media lifecycle, persistence и redirects в одном модуле.
- Нет application service/use-case boundary для `monitorListings`, `compareSnapshot`, `applyCorrection`.
- Нет external request abstraction с timeout, retry, circuit breaker, rate limit per provider или correlation ID.
- Error handling в API отдаёт generic message, но logging остаётся `console.error`; нет structured event schema.
- `getStore()` кеширует singleton process-local (`src/lib/data/index.ts:5-22`), а in-memory rate limiter также process-local (`src/lib/rate-limit.ts:1-33`). Это не distributed-safe при нескольких replicas.

**INFERENCE.** Нужен не большой rewrite, а отдельный bounded module `src/lib/marketplaces/` (contracts/connectors/normalizers) и `src/lib/marketplace-monitoring/` (use cases/comparison/severity). Existing rental store следует оставить стабильным.

## 10. Frontend

**FACT.** Public pages преимущественно server-rendered и получают данные через store; client components используются для каталога, форм, галерей, темы и media uploader.

**FACT.** Формы имеют серверную Zod validation, loading/error UI в booking/admin areas и reusable car/media components.

**UNKNOWN.** Полное accessibility и browser matrix покрытие не подтверждено: в репозитории есть component tests, но нет CI/E2E suite и отчёта с автоматическими axe checks.

**INFERENCE.** Dashboard мониторинга лучше сделать server-rendered initial read model + небольшой client filter/refresh layer. Не следует заставлять таблицу напрямую вызывать connector APIs из браузера: credentials и normalization должны оставаться server-side.

Готовность к сложному dashboard: **5/10**. Layout/navigation/table primitives есть, но нет API/read model, polling policy, pagination, discrepancy grouping, optimistic/manual action model.

## 11. Integrations

Обнаруженные интеграции:

1. **Supabase Storage** — signed upload, delete и download через service-role key (`src/lib/supabase-storage.ts:21-56`).
2. **Yandex Disk public media** — public key hardcoded, download URL fetched server-side (`src/lib/yandex-public-media.ts:1-12`, `src/app/api/media/yandex/route.ts:7-20`).
3. **CRM webhook** — fire-and-forget POST после сохранения booking, без timeout/retry/status persistence (`src/app/api/bookings/route.ts:29-30`).

**FACT.** Выделенного integration/service layer для marketplace нет. API credentials читаются из env; refresh tokens, rate limit provider, retry policy, circuit breaker, idempotency для external calls и request log отсутствуют.

**Ответ.** Подключить marketplace API «безопасно сразу» нельзя. Подключить его после добавления connector contract, secret isolation, timeout/retry/rate policy, raw response redaction и persisted run log — можно без изменения публичного rental flow.

## 12. Background Jobs

**FACT.** В `scripts/` есть one-off seed/import/hash/env utilities, а `deploy/rpm-rent-backup.timer` — системный backup timer. Нет application worker, queue, cron для marketplace, distributed lock или job retry.

**INFERENCE.** Для текущего Docker Compose стека минимальный production-подход:

1. отдельный `worker` service с тем же image и одной queue-backed job runner;
2. PostgreSQL-backed jobs на старте, если нагрузка мала, либо Redis/managed queue при росте;
3. DB advisory lock или unique run lock на `(marketplace, account, time bucket)`;
4. persisted `SyncRun` state: queued/running/succeeded/failed/partial;
5. bounded retries with exponential backoff and provider rate limit;
6. systemd timer/cron только как trigger enqueue, не как место comparison logic.

Не внедрять на этом этапе: multi-region scheduler, Kafka, event sourcing, generic workflow engine.

## 13. Security

### Authentication

**FACT.** Password проверяется через scrypt (`src/lib/auth.ts:46-57`); cookie HttpOnly, SameSite=Lax, Secure in production, HMAC SHA-256 signed and expires after 10 hours (`src/lib/auth.ts:5-20`). Login rate limit — 5 attempts per 15 min per forwarded IP + email key (`src/app/admin/login/actions.ts:10-22`).

**FACT.** Нет password reset, MFA, session revocation store, per-user session inventory или brute-force protection shared across replicas. `x-forwarded-for` принимается без видимой proxy trust policy (`src/app/admin/login/actions.ts:16-19`).

### Authorization

**FACT.** Admin layout, Server Actions и media routes проверяют наличие signed admin cookie. Ролевой проверки нет. ID values в actions берутся из FormData и передаются в store; ownership validation для автомобилей не нужна для single-admin, но станет обязательной для multi-user.

**UNKNOWN.** Нельзя подтвердить конфигурацию reverse proxy, trusted headers и production secret rotation только по репозиторию.

### API/input

**FACT.** Booking route ограничивает body 32 KB, rate-limits, парсит JSON через Zod и применяет strict schema (`src/app/api/bookings/route.ts:9-26`, `src/lib/validation.ts:30-61`). Admin text schemas запрещают HTML/control characters.

**FACT.** Media path traversal защищён regex/path resolver (`src/lib/admin-media.ts:38-42`, `src/lib/local-media.ts:13-20`). Upload ограничен MIME header и 15 MB (`src/lib/admin-media.ts:1-20`).

**RISK.** MIME определяется по client/request header, но не по magic bytes и не проверяется декодированием изображения. Вредоносный polyglot или файл с неверным content-type остаётся возможным классом риска. Это **M**, priority MUST FIX до доверенного external ingestion.

**RISK.** `/api/media/storage` публично отдаёт path-валидные media objects без auth (`src/app/api/media/storage/route.ts:6-27`). Сейчас path содержит только car/location owner path и UUID, но public/private intent не закреплён отдельной ACL. Для будущих marketplace documents нужно отдельное private storage boundary.

**RISK.** CRM webhook вызывается без timeout, retry, signature, delivery log или response validation (`src/app/api/bookings/route.ts:29-30`). Это не блокирует monitoring, но является reliability gap.

### Secrets

**FACT.** `.env.local` не отслеживается и содержит только локальные ключи `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_YANDEX_METRIKA_ID`; значения в отчёт не выводятся. `.env.example` перечисляет server-only `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, auth variables.

**FACT.** `git ls-files` не показал tracked env/secret files; `.gitignore` исключает `.env*`, `.data`, `src/generated`.

**UNKNOWN.** Полную проверку всей истории секретов и production host secrets нельзя считать доказанной без secret-scanning tool и доступа к origin/CI secret store. В отчёте реальные секреты не раскрываются.

## 14. Testing

Команда: `pnpm test`  
Результат: **exit 0; 66 test files, 263 tests passed; duration 87.81s**.

Покрыты unit/domain tests для booking, dates, availability, validation, auth, rate limit, data stores, media helpers; component tests для car forms/cards/gallery/admin uploader; route tests для bookings and media upload/signing.

**FACT.** Есть дублирование обнаруженных test paths из `.next/standalone` и `src` в Vitest run; это увеличивает время и может маскировать реальное количество независимых тестов.

Недостающее перед Marketplace Monitoring:

- connector contract tests with recorded/redacted Avito fixtures;
- normalization contract tests: missing/changed/locale/currency/units;
- deterministic comparison matrix and severity tests;
- snapshot persistence and idempotent rerun tests;
- retry/rate-limit/timeout/circuit tests;
- lock/concurrent run tests;
- end-to-end admin dashboard with auth and discrepancy states;
- migration integration tests against PostgreSQL, not only FileStore;
- security tests for object access, malformed media, SSRF-like URLs and oversized payloads;
- smoke test for worker and deployment rollback.

## 15. Dependencies

**FACT.** Runtime dependencies are intentionally small: Next, React, Prisma PostgreSQL adapter/client, `pg`, `zod`, `lucide-react`; tooling: ESLint, TypeScript, Vitest, tsx.

Команда: `pnpm audit --prod --audit-level high`  
Результат: **exit 1; 2 high vulnerabilities**:

| Severity | Package/path | Finding |
|---|---|---|
| High | `nanoid` via `next > postcss > nanoid`, vulnerable `<3.3.18` | custom generator can loop indefinitely when size is zero |
| High | `deepmerge-ts` via `@prisma/client > prisma > @prisma/config > deepmerge-ts`, vulnerable `<8.0.0` | stack exhaustion on recursive object graphs |

Не обновлять зависимости в рамках этого аудита. Проверить lockfile resolution и совместимость patched versions до следующего production release.

**UNKNOWN.** `pnpm outdated` не запускался: audit достаточно показал security signal, а обновление dependency metadata не нужно для разрешённого артефакта.

## 16. Deployment & Production

**FACT.** Docker builder выполняет `pnpm prisma:generate` и `pnpm exec next build`; runner запускает standalone `server.js` от non-root `nextjs` (`Dockerfile:29-45`). Compose имеет PostgreSQL, app, Caddy и optional tools; app получает persistent `media_data`.

**FACT.** `deploy/deploy.sh` сначала делает backup при работающем DB, build tools/app, затем запускает `prisma:deploy` перед app/caddy (`deploy/deploy.sh:15-28`).

**FACT.** Ежедневный backup DB и media предусмотрен systemd timer; DB dumps хранятся локально до 7 дней (`deploy/backup-db.sh:10-29`).

**FACT.** Caddy reverse-proxy не содержит health endpoint policy, access log/retention policy или explicit rate limit (`deploy/Caddyfile`). В приложении нет `/healthz`/readiness route.

**INFERENCE.** До расширения функциональности желательно решить: external/off-host backup copy, restore drill, health/readiness, structured logs/error tracking, deployment rollback strategy, migration failure handling and secret rotation. Это production readiness gap, но не повод для architectural redesign.

## 17. Technical Debt

### BLOCKER

1. **Проблема:** отсутствует доменная модель external listing.  
   **Почему:** нельзя связать один `Car` с несколькими площадками, хранить external identity и source-specific state.  
   **Где:** `prisma/schema.prisma:11-65`.  
   **Последствия:** дублирование Car, потеря истории, невозможность корректного diff/sync.  
   **Что сделать:** добавить минимальные `Marketplace`, `MarketplaceListing`, `MarketplaceSnapshot`/discrepancy boundaries.  
   **Сложность:** `L`.

2. **Проблема:** нет background execution и run locking.  
   **Почему:** monitoring нельзя надёжно выполнять по расписанию и повторять.  
   **Где:** отсутствует в `src`, `scripts`, `compose.production.yml` (кроме backup timer).  
   **Последствия:** зависимость от ручного запуска, duplicate runs, таймауты web request.  
   **Что сделать:** worker + persisted runs + lock + retry.  
   **Сложность:** `L`.

### MUST FIX

3. **Проблема:** один admin account без ролей/audit.  
   **Почему:** manual correction и auto sync не имеют actor/permission boundary.  
   **Где:** `src/lib/auth.ts:16-44`.  
   **Последствия:** невозможно безопасно делегировать доступ и расследовать изменения.  
   **Что сделать:** минимум admin identity/role + append-only audit events; Auto Sync отдельно feature-flagged.  
   **Сложность:** `M-L`.

4. **Проблема:** media validation проверяет declared MIME, не content bytes.  
   **Где:** `src/lib/admin-media.ts:13-20`, `src/app/api/admin/media/local-upload/route.ts:15-18`.  
   **Последствия:** malicious upload risk; external media ingestion будет слабее.  
   **Что сделать:** magic-byte/image decoder validation, quarantine, max dimensions, optional malware scanning.  
   **Сложность:** `M`.

5. **Проблема:** audit/observability для external calls отсутствуют.  
   **Где:** `src/app/api/bookings/route.ts:29-30`, `src/lib/supabase-storage.ts`.  
   **Последствия:** нельзя объяснить, почему marketplace run неполный или повторился.  
   **Что сделать:** structured event log, redacted request metadata, correlation/run ID, durations and outcomes.  
   **Сложность:** `M`.

### SHOULD FIX

6. **Проблема:** process-local rate limiter and FileStore singleton are not multi-replica primitives.  
   **Где:** `src/lib/rate-limit.ts:1-33`, `src/lib/data/index.ts:5-22`.  
   **Последствия:** uneven protection and inconsistent dev behavior under horizontal scaling.  
   **Что сделать:** managed/shared limiter only where needed; ensure worker reads authoritative DB.  
   **Сложность:** `S-M`.

7. **Проблема:** no CI configuration and no automated deployment gate.  
   **Где:** absent `.github`; checks documented only in `README.md`.  
   **Последствия:** regressions/security audit may not block release.  
   **Что сделать:** CI for lint/typecheck/test/build-without-migrate, migration integration and audit.  
   **Сложность:** `S-M`.

8. **Проблема:** no health/readiness and restore verification.  
   **Где:** `deploy/Caddyfile`, `deploy/backup-db.sh`.  
   **Последствия:** failure detection and disaster recovery are not evidenced.  
   **Что сделать:** health endpoints, monitoring, periodic restore drill and off-host retention.  
   **Сложность:** `M`.

### NICE TO HAVE

- explicit `isPrimary` on media, if business semantics diverge from first sort order (`S`);
- replace broad JSON rental fields with typed canonical fields only where comparison proves need (`M`, YAGNI otherwise);
- deduplicate Vitest discovery of `.next/standalone` tests (`XS-S`);
- add E2E/accessibility test harness (`M`).

## 18. Marketplace Readiness

| Capability | Score | Evidence / reason |
|---|---:|---|
| Architecture | 6/10 | `DataStore` and domain helpers exist, but no marketplace bounded context |
| Backend | 6/10 | reasonable current CRUD/booking boundaries; actions and integrations are not designed for long workflows |
| Frontend | 5/10 | reusable admin shell and tables; no monitoring read model/state |
| Database | 5/10 | solid rental schema/constraints; no listing/snapshot/history tables |
| Admin Panel | 6/10 | centralized navigation and car/media CRUD; single-admin only |
| Security | 5/10 | good baseline cookie/hash/input/path checks; no roles, MFA, byte validation, secret scan evidence |
| Testing | 6/10 | 263 tests pass; no connector/worker/production DB/E2E coverage |
| Observability | 3/10 | console logs, no structured logs, metrics, alerts or run history |
| Maintainability | 6/10 | small dependency set and interfaces; admin orchestration concentrated |
| Scalability | 5/10 | PostgreSQL model can scale after new tables; process-local primitives and no worker are gaps |
| Marketplace readiness | 2/10 | no connector/listing/snapshot/comparison/monitoring infrastructure |
| Production readiness | 6/10 | Docker, backups, migrations and non-root runner exist; health/restore/CI/observability gaps |

Overall Marketplace Monitoring readiness: **2/10 before refactor; 5/10 after minimum foundation; 7/10 after Avito MVP with run history and tests.**

## 19. Proposed Marketplace Architecture

Минимальная модель без overengineering:

```text
Car                         existing master card
Marketplace                 AVITO initially, later AUTO_RU/DROM/SITE
MarketplaceListing          one external publication for one Car + Marketplace
MarketplaceSnapshot         normalized/raw values observed at a point in time
MarketplaceDiscrepancy      actionable difference between master and snapshot
MarketplaceSyncRun          one monitoring attempt and its outcome
AuditEvent                  actor/source/change history for manual/automatic writes
```

Минимальные связи:

```text
Car 1 ── N MarketplaceListing N ── 1 Marketplace
Listing 1 ── N Snapshot
SyncRun 1 ── N Snapshot/Discrepancy
Discrepancy N ── 1 Listing
AuditEvent → car/listing/discrepancy (polymorphic target or explicit nullable FKs)
```

`MarketplaceAccount` нужно добавлять только если одна площадка поддерживает несколько кабинетов/тенантов. Для первого Avito account можно хранить credential reference в server secret manager и account metadata в DB, но не сохранять raw token в snapshot.

`MarketplaceFieldMapping` откладывается: сначала canonical code mapping в connector/normalizer. Таблица mapping появится, когда бизнес реально потребует редактируемые админом mappings.

## 20. Source of Truth Analysis

### Variant A: Avito is Source of Truth

Плюсы: старт совпадает с текущим ориентиром и бизнес-процессом; удобно быстро ловить расхождения с сайтом.  
Минусы: Avito может иметь platform-specific truncation, модерационные изменения, задержки и не все rental fields; внешний источник трудно аудировать как master.  
Технический риск: circular correction, если не различать observed value и approved value.  
Организационный риск: сотрудник редактирует Avito, а сайт становится ведомым без контроля.

### Variant B: RPM Admin is Source of Truth

Плюсы: один master, deterministic fan-out на сайт/Avito/Auto.ru/Drom; управляемые approvals, audit, permissions; connector details изолированы.  
Минусы: нужно сначала наполнить и проверить master; нужен процесс публикации и обработки platform-specific fields.  
Технический риск: connector не сможет выразить все ограничения площадки; это решается capability/validation report.  
Организационный риск: требуется договориться, что изменения делаются в RPM, а не вручную на площадке.

**Рекомендация: Variant B.** В MVP Avito может быть reference для первоначального reconciliation, но не authoritative write source. Хранить отдельно `master value`, `observed external value`, `last accepted/overridden decision`. Это позволяет начать с мониторинга и не сделать Auto Sync обязательным.

## 21. Comparison Engine

Comparison pipeline:

```text
fetch external listing
  → validate raw payload
  → normalize to canonical MarketplaceListingData
  → resolve listing to Car
  → compare field policies
  → classify severity
  → persist snapshot/discrepancies idempotently
  → update dashboard/alert counters
```

Структурированные значения сравнивать детерминированно: brand/model/year, horsepower, transmission, drive, color, price, deposit, age, experience, mileage, availability, image count/order. Перед сравнением применять единицы, валюту, locale, whitespace and null policy. Для денег сравнивать integer minor units/рубли по одной явной policy.

Текст:

- title: normalized exact/token comparison, warning on meaningful token change;
- description/conditions: normalize whitespace, punctuation and known boilerplate; для critical terms — explicit required tokens/rules;
- semantic/LLM comparison — только triage или suggested review, никогда не единственный источник для цены, залога, eligibility или availability.

Изображения:

- exact hash для повторов;
- perceptual hash для resized/compressed copies;
- compare count, order, primary image and missing hashes;
- сохранять image metadata/hash в snapshot, не скачивать бесконечно при каждом run;
- `CRITICAL` только если image mismatch нарушает бизнес policy, иначе `WARNING`.

Idempotency key для discrepancy: `(listingId, fieldCode, normalizedMasterHash, normalizedExternalHash, run policy/version)`. Это позволяет распознавать повторяющееся расхождение без сложного event sourcing.

## 22. Marketplace Connector Architecture

Рекомендуемый server-side contract:

```ts
interface MarketplaceConnector {
  healthCheck(): Promise<ConnectorHealth>;
  listListings(cursor?: string): Promise<ListListingsResult>;
  getListing(externalId: string): Promise<RawListing>;
  normalizeListing(raw: RawListing): CanonicalListing;
  getImages?(listing: CanonicalListing): Promise<CanonicalImage[]>;
  updateListing?(command: UpdateListingCommand): Promise<UpdateResult>;
}
```

`authenticate` лучше скрыть внутри connector/session provider: бизнес-логика не должна знать refresh token details. `updateListing` сделать optional и feature-flagged, чтобы Monitor connector мог существовать без write permission.

Физически:

```text
src/lib/marketplaces/contracts.ts
src/lib/marketplaces/avito/avito-connector.ts
src/lib/marketplaces/avito/avito-client.ts
src/lib/marketplaces/normalization.ts
src/lib/marketplace-monitoring/comparison.ts
src/lib/marketplace-monitoring/run-monitoring.ts
src/lib/marketplace-monitoring/severity.ts
```

Connector отвечает за protocol/auth/raw API limits. Normalizer — за canonical DTO. Comparison — за domain policy. Worker/use case — за orchestration, persistence, retry and idempotency. UI читает persisted read model, не вызывает connectors.

## 23. Audit & History

**FACT.** Текущий `Car.updatedAt` и `Booking` timestamps не являются audit log. В коде нет actor/source/old/new event store.

Минимальный `AuditEvent` должен фиксировать:

```text
id, occurredAt, actorType (admin/system), actorId/email,
source (admin-ui/monitor/manual-sync/auto-sync),
entityType, entityId, action, fieldCode,
oldValueRedacted, newValueRedacted, syncRunId, correlationId
```

Секреты, access tokens и raw personal data не писать в event payload. Для ручного исправления запись должна создаваться в той же transaction, что и изменение listing/master state.

## 24. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Wrong listing-to-car matching | Medium | Critical | explicit external ID + manual linking + confidence/ambiguous state |
| Avito API limits/contract changes | High | High | connector isolation, rate policy, health state, raw schema version |
| Price/deposit correction applied to wrong listing | Medium | Critical | Monitor first, approval, idempotency, audit, no Auto Sync by default |
| Duplicate concurrent runs | High without worker lock | High | DB lock + unique run key |
| Image mismatch false positives | Medium | Medium | perceptual hash thresholds + manual review |
| External payload exposes secrets/PII in logs | Medium | High | redaction and structured allowlist logging |
| DB migration/deploy failure | Medium | High | preflight, backup restore drill, rollback plan |
| Multi-replica in-memory limiter gap | Medium | Medium | shared limiter or edge protection |
| Local media volume loss | Medium | High | verified off-host media backup and restore |

## 25. Readiness Score

Scores above are intentionally conservative and refer to Marketplace Monitoring readiness, not visual quality of the site. The decisive low score is not caused by lack of UI polish; it is caused by missing domain/integration/runtime primitives.

## 26. Recommended MVP

Цель: сотрудник открывает админку и видит соответствие RPM master card и Avito listing.

Минимальный набор:

1. `Marketplace` with `AVITO`.
2. `MarketplaceListing` linked to existing `Car`, external Avito ID/URL, active/link status.
3. One secure Avito connector in read-only mode.
4. Canonical normalized DTO for a small field set: title/model/year, price, deposit, availability, required rental terms, image count/primary/hash.
5. Manual link/unlink flow for ambiguous matches.
6. `SyncRun` + latest snapshot + discrepancy rows.
7. Deterministic comparison and four severity levels.
8. Read-only admin section `Контроль площадок` with list/table and detail panel:

```text
Car | RPM | Avito | overall status
```

and:

```text
field | RPM value | Avito value | severity | last checked
```

9. Basic run status/error message and “refresh check” action guarded against concurrent run.
10. Tests for normalization, comparison, persistence idempotency and connector failures.

Не входит в MVP: auto update, Auto.ru/Drom, notifications, editable field mappings, LLM, advanced analytics, distributed event bus.

## 27. Recommended Roadmap

| Phase | Goal/result | Dependencies/risk | Complexity |
|---|---|---|---:|
| 0. Production guardrails | patch/triage 2 high dependency findings, secret scan, health/readiness, backup restore drill, CI checks | dependency compatibility and deployment access | M |
| 1. Master data contract | document canonical car fields, source-of-truth policy, archive/link rules; no UI change required | business approval of RPM as master | S-M |
| 2. Marketplace foundation | add Marketplace/Listing/Snapshot/Discrepancy/SyncRun minimum schema and services | migration and historical identity strategy | L |
| 3. Execution foundation | worker/trigger, lock, retry, timeout, run logging and redaction | deployment topology | L |
| 4. Avito read-only connector | authenticate, fetch, normalize and fixture tests | Avito API access/limits/credentials | L-XL |
| 5. Comparison engine | field policies, image hashes, severity, recurring discrepancy key | canonical DTO and snapshot model | M-L |
| 6. Monitoring UI | admin list/detail, filters, last-run health, manual refresh | persisted read model and auth | M |
| 7. Operational hardening | alerts, metrics, dashboards, retry controls, restore/rollback runbook | observability stack | M |
| 8. Manual Sync | explicit approval, preview, audit and connector write capability | per-field write policy, permissions | L |
| 9. Other platforms | Auto.ru/Drom/Site connectors using same contract | each platform’s API/capabilities | M per connector |
| 10. Auto Sync | restricted, feature-flagged, policy-based automation | proven monitoring/manual correction history | XL / later |

## 28. Final Verdict

**C — REFACTOR REQUIRED.**

Why:

- `Car` is a good current site master record, but not a multi-publication model (`prisma/schema.prisma:11-65`).
- The app has no marketplace connector/integration layer or external identity mapping.
- The app has no recurring job/worker/lock/retry infrastructure.
- The app has no snapshot, discrepancy, audit or repeated-difference history.
- Admin authorization is single-account and roleless (`src/lib/auth.ts:16-44`).

This does **not** justify redesigning the whole product. The existing Next/Prisma structure can support the new module if the marketplace functionality is introduced as a bounded context alongside the existing rental domain. Preserve `Car` as the RPM master card, add separate listing/observation history, start with read-only Avito Monitoring, and postpone write synchronization until the data and operational behavior are proven.

### Verification record

| Command | Result |
|---|---|
| `pnpm test` | exit 0; 66 files, 263 tests passed |
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0 |
| `pnpm prisma:validate` | exit 0; schema valid |
| `pnpm exec next build` | exit 0; compiled and generated 28 routes; used `.env.local` and dev FileStore because `DATABASE_URL` was absent |
| `pnpm audit --prod --audit-level high` | exit 1; 2 high transitive vulnerabilities |
| `pnpm build` | intentionally not run: script invokes `prisma migrate deploy`, which can alter production DB |

