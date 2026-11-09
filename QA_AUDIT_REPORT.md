# QA audit report

## Executive summary

Проведён baseline-аудит Next.js 16 / React 19 приложения RPM Rent, включая исходники, доменную логику, persisted FileStore, HTTP-маршруты и browser smoke в Chromium, Firefox и WebKit.

Исправлены подтверждённые дефекты: ложный автомобиль по умолчанию в booking, публичные внутренние тексты импорта, устаревшие данные в persisted stores, отсутствующий favicon, два безопасных legacy redirect и предупреждение Next 16 о полном tracing проекта media proxy.

## Environment

- Next.js 16.3.0, React 19.2.8, TypeScript 6.0.3, Prisma 7.9.1, Vitest 3.2.4.
- FileStore использовался локально, потому что `DATABASE_URL` не настроен; Prisma migration deploy пропущен из-за недоступного локального PostgreSQL.
- Production-like запуск выполнен через `.next/standalone/server.js` с копированием `public` и `.next/static`, как в Dockerfile.

## Routes tested

Проверены HTTP 200: `/`, `/cars`, `/services`, `/rental-terms`, `/about`, `/contacts`, `/faq`, `/booking`, legal pages, `/spasibo`, `/robots.txt`, `/sitemap.xml`.

Проверены not-found: `/cars/does-not-exist`, `/not-found`, `/petersburg/test`, `/sochi/test`.

Из sitemap проверены все 44 URL `/cars/:slug`; битых карточек не найдено.

Query cases: `/booking`, `/booking?service=daily`, `/booking?car=does-not-exist`, catalog query filters.

## Browsers tested

- Chromium: home, catalog, booking, mobile overflow smoke.
- Firefox: home, 0 console errors, 2 preload warnings.
- WebKit: home, 0 console errors, 1 third-party preload warning.

## Viewports tested

Проверены 320×568 и 390×844 на каталоге; горизонтальный overflow не обнаружен (`scrollWidth === innerWidth`). Browser smoke также выполнен на desktop default viewport. Полная визуальная матрица всех перечисленных размеров требует отдельного длительного прогона с отключением/изоляцией внешнего MyReviews iframe.

## Bugs found

### HIGH — booking без `?car` создавал ложный выбор

- Location: `src/app/booking/booking-form.tsx`.
- Reproduction: открыть `/booking` напрямую.
- Root cause: fallback `cars.find(...) ?? cars[0]`.
- Fix: явное состояние «Выберите автомобиль»; машина появляется только при валидном slug или выборе пользователя.
- Regression: `src/app/booking/booking-form.test.tsx`.

### HIGH — служебный copy показывался пользователю

- Location: `src/components/car-imported-details.tsx`, `src/data/imported-cars.ts`.
- Reproduction: открыть импортированную карточку автомобиля.
- Root cause: строки про рабочий стандарт, зелёные столбцы и импорт попали в public fields.
- Fix: пользовательские формулировки и целевая нормализация известных OCR/confusable артефактов.
- Regression: `src/data/imported-cars.test.ts`, `src/lib/data/file-store.test.ts`.

### MEDIUM — устаревшие persisted car records обходили очистку source data

- Root cause: уже сохранённые FileStore/Prisma записи не проходили нормализацию.
- Fix: public copy нормализуется при чтении обоих хранилищ.
- Regression: `FileStore booking integrity > hides legacy internal copy when reading an existing database`.

### MEDIUM — отсутствовал favicon

- Reproduction: browser console показывал 404 `/favicon.ico`.
- Fix: добавлен `src/app/icon.svg`, Next генерирует `/icon.svg`.

### MEDIUM — legacy catalog URLs заканчивались 404/лишним 308

- Fix: permanent redirects `/home` → `/` и `/category/avto-v-arendu(/)` → `/cars`.
- Regression: `src/config/redirects.test.ts`.

### LOW — Next 16 предупреждал о tracing всего проекта

- Root cause: dynamic `readFile(absolutePath)` в media proxy.
- Fix: добавлен официальный `turbopackIgnore` marker на чтение пользовательского media path.

## Content/data issues

- Найдены и очищены известные confusable/OCR строки: `Сompetition`, смешанные кириллические/латинские символы в отдельных характеристиках, `Sроrt Сhrоnо`, `ceкунды`, дублированная подпись поколения.
- Текущий локальный `.data/db.json` содержит 44 опубликованные записи с `minimumAge`, `minimumDrivingExperience`, `minimumRentalDays = null` и `available = false`. Это блокирует реальное оформление заявки и требует подтверждённой бизнес-миграции данных, а не автоматической догадки.

## Responsive issues

На проверенных 320×568 и 390×844 overflow не найден. Mobile catalog exposes a real `Фильтры` button; desktop exposes the filter sidebar.

## Accessibility

Проверены доступные имена основных навигационных ссылок, controls theme/filter/sort, form labels, booking consent and error alert through browser snapshots. Полный axe-run не выполнялся: пакет axe отсутствует в репозитории.

## SEO

Проверены title, canonical declarations, robots, sitemap route and unique car metadata in source. `/admin/` и `/api/` disallowed in robots. Geographic legacy URL strategy intentionally left unmapped pending owner confirmation.

## Performance

Build проходит. Предупреждение dynamic filesystem tracing устранено. Внешний MyReviews widget отдаёт preload warning; это third-party limitation и не console error приложения.

## Security review

Проверены server-side Zod validation, strict payload boundary, consent, idempotency key, rate limit, booking overlap checks, path traversal protection and safe admin return paths. Destructive production security testing не выполнялся.

## Legacy URLs

Безопасно перенаправлены только verified direct equivalents: `/home` и старый каталог. `/sochi/...`, `/petersburg/...`, `/uslugi/...` не перенаправлялись автоматически, потому что их исторический бизнес-контент не подтверждён.

## Tests added

- Public import-copy regression.
- Persisted FileStore legacy-copy regression.
- Booking direct URL must not preselect a car.
- Verified legacy redirects.

## Remaining known limitations

1. Необходимо заполнить и подтвердить policy fields для 44 persisted автомобилей в production database; без этого server-side booking правильно блокируется.
2. Нужен владелец-верифицированный mapping старых `/sochi`, `/petersburg`, `/uslugi` и старых car URLs.
3. Для полного accessibility gate следует добавить axe в QA-инфраструктуру.
4. Для полной screenshot matrix следует изолировать внешний MyReviews iframe и прогнать все заданные viewport/browser combinations.

## Final verification

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: 84 test files, 297 tests passed.
- `pnpm build`: pass; 28 routes generated.
- Chromium/Firefox/WebKit home smoke: 0 application console errors.
- `/booking` direct: explicit car selection; selected car retained after choosing Porsche.
