# Marketplace Monitoring MVP

## Назначение

Раздел «Контроль площадок» сравнивает master-карточки `Car` в RPM Rent с наблюдаемым состоянием собственных объявлений Avito. Интеграция только читает Avito: изменение, публикация и удаление объявлений не реализованы.

## Архитектура и поток данных

```text
Admin Server Action
  → MarketplaceMonitoringService
  → AvitoConnector (OAuth2, HTTP, Zod validation)
  → CanonicalMarketplaceListing
  → deterministic comparison with Car
  → MarketplaceSnapshot + MarketplaceDiscrepancy
  → admin summary/detail
```

`Car` остаётся source of truth и не содержит Avito-specific полей. `MarketplaceConnector` — общий read-only контракт; `AvitoConnector` изолирует HTTP, авторизацию, pagination, timeout/retry и нормализацию ответа. Orchestration не зависит от React и позже может вызываться планировщиком без изменения comparison logic.

## Domain entities

- `Marketplace` — площадка (`AVITO`).
- `MarketplaceListing` — подтверждённая связь одного `Car` с одним внешним ID на площадке.
- `MarketplaceSyncRun` — ручной запуск со статусом `RUNNING`, `SUCCESS`, `PARTIAL` или `FAILED`.
- `MarketplaceSnapshot` — очищенный raw payload, canonical DTO, результаты сравнения и SHA-256 payload hash.
- `MarketplaceDiscrepancy` — историческое расхождение с fingerprint, временем первого/последнего обнаружения и статусом `OPEN`/`RESOLVED`/`IGNORED`.
- `MarketplaceAuditLog` — actor, время и результат link/unlink/refresh.

PostgreSQL обеспечивает уникальность внешнего объявления, единственную активную связь автомобиля с площадкой и единственный `RUNNING`-запуск Avito. Зависшие более 15 минут запуски перед новым запуском переводятся в `FAILED`.

## Comparison policies

Официальный own-items endpoint предоставляет для MVP только пригодные для надёжного сравнения title, integer price и publication status. Поэтому сравниваются:

| Поле | Политика | Severity при mismatch |
| --- | --- | --- |
| `pricePerDay` ↔ `price` | точное сравнение integer RUB | `CRITICAL` |
| `published` ↔ Avito `status === active` | точное boolean | `CRITICAL` |
| `title` ↔ `title` | NFKC, lowercase, punctuation/whitespace normalization | `WARNING` |

Статус `active` означает публикацию объявления, а не доступность автомобиля для аренды, поэтому он намеренно не сравнивается с `Car.available`. Значение, которое API не вернул, получает `NOT_AVAILABLE` и не создаёт discrepancy. Поля залога, описания, характеристик, условий и изображений не сравниваются: используемый официальный endpoint их не подтверждает.

Fingerprint включает listing, field, нормализованные master/external values и версию policy. Повторная та же проблема обновляет `lastDetectedAt`; совпавшее поле переводит прежнюю проблему в `RESOLVED`; новые значения создают новую историческую запись.

## Manual linking

1. Администратор вводит numeric external ID или HTTPS URL на домене `avito.ru`.
2. Сервер валидирует hostname и извлекает ID, но никогда не запрашивает пользовательский URL.
3. Connector ищет ID среди собственных объявлений через официальный endpoint и показывает preview.
4. После явного подтверждения сервер повторно получает объявление и сохраняет только ID/URL из проверенного API response.

Одна публикация не может быть связана с несколькими автомобилями. Link и unlink требуют активную admin session и записываются в audit log.

## Manual refresh

Кнопка «Проверить сейчас» вызывает server-side monitoring service. Connector одним paginated scan получает собственные объявления, после чего сервис проверяет связанные автомобили, сохраняет snapshot и обновляет discrepancy history. Частично отсутствующие объявления дают `PARTIAL`; системная/API ошибка — `FAILED`. PostgreSQL partial unique index отклоняет параллельный запуск с сообщением «Проверка Avito уже выполняется».

## Error states

- `NOT_CONFIGURED` — нет server-side credentials.
- `AUTH_ERROR` — Avito отклонил OAuth/token или API авторизацию.
- `NOT_FOUND` — связанный ID отсутствует среди объявлений аккаунта.
- `RATE_LIMITED` — исчерпаны ограниченные retry после HTTP 429.
- `API_ERROR` — network, non-retryable HTTP или исчерпанные 5xx retry.
- `TIMEOUT` — сработал AbortController timeout.
- `INVALID_RESPONSE` — response не прошёл Zod validation или pagination guard.
- `PARTIAL_SUCCESS` — часть связанных объявлений не проверена.
- `INTERNAL_ERROR` — сбой persistence/внутренней orchestration, не маскируемый под ошибку Avito.

UI отличает `OK`, `WARNING`, `ERROR`, `CRITICAL`, `NOT LINKED` и `CHECK FAILED`. Последний статус не маскируется под отсутствие расхождений.

## Environment

```dotenv
AVITO_CLIENT_ID=
AVITO_CLIENT_SECRET=
AVITO_TIMEOUT_MS=10000
```

Все переменные server-only; у них нет префикса `NEXT_PUBLIC_`. Access token хранится только в памяти процесса до истечения срока, не логируется и не попадает в snapshots. Marketplace persistence требует PostgreSQL `DATABASE_URL`; FileStore остаётся рабочим для остального development flow, но мониторинг в нём явно отключён.

## Testing

Fixture-backed tests покрывают pagination, empty response, auth error, rate limit, timeout, invalid response, allowlist raw fields, URL validation, normalization, comparison/null policy, discrepancy lifecycle, orchestration/partial failure/concurrency contract, dashboard statuses и authorization server actions. Live Avito вызовы без credentials не выполнялись.

Безопасный локальный набор проверок:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm prisma:validate
pnpm exec next build
```

Не используйте `pnpm build` для локальной проверки: существующий script пытается выполнить `prisma migrate deploy`.

## Future work

- scheduled monitoring
- worker
- alerts/notifications
- manual correction through API
- Auto.ru
- Drom
- Auto Sync
