# Deployment checklist

- [ ] Заполнены и проверены все значения из `RELEASE_BLOCKERS.md`.
- [ ] `DATABASE_URL`, `AUTH_SECRET`, учётные данные администратора заданы только в секретах окружения.
- [ ] Выполнены `pnpm prisma:generate`, `pnpm prisma:migrate:deploy`, `pnpm build`.
- [ ] PostgreSQL резервируется и проверено восстановление.
- [ ] Проверены HTTPS, canonical URL, analytics и CRM webhook.
- [ ] Пройдена мобильная воронка: даты → каталог → авто → заявка → admin.
- [ ] Проверены конфликтная заявка, повторная отправка и отказанный статус.
