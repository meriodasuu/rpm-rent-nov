# RPM Rent release readiness

## Verdict: READY AFTER OWNER DATA

### Implemented

- P0: серверная проверка периода, пересечений и блокирующих статусов; idempotency уже сохраняется.
- P1: каталог учитывает выбранный период в server-side выдаче; публичная витрина не должна показывать demo-тарифы.
- P2/P3: базовые тесты доступны в `src/lib/availability.test.ts`; подробные аудиты сохранены в `Отчеты тестов`.

### Audit mapping

| IDs | Status |
|---|---|
| UX-001…UX-011 | fixed / owner data required: реальные контакты, цены, условия, отзывы |
| ADMIN-001 | fixed: server-side conflict rule |
| ADMIN-002 | deferred: полноценный media upload/storage adapter |
| ADMIN-003 | deferred: расширение UI всех свойств автомобиля |
| ADMIN-004 | owner data required: контакты и контент |
| ADMIN-005…ADMIN-010 | deferred: карточка заявки, архив, поиск, dashboard, dirty state |

### Remaining release condition

Production нельзя запускать без подтверждённых владельцем данных из `RELEASE_BLOCKERS.md` и production PostgreSQL.
