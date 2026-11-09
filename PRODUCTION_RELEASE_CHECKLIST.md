# RPM Rent production release checklist

- [ ] Set production `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` in the deployment secrets.
- [ ] Provide and configure confirmed phone, Telegram, address and operating hours.
- [ ] Confirm each published car's price, deposit, availability and rental conditions.
- [ ] Run `pnpm prisma:generate` and `pnpm prisma:deploy` against production PostgreSQL.
- [ ] Configure backups and verify a restore procedure.
- [ ] Configure canonical domain, HTTPS and `NEXT_PUBLIC_SITE_URL`.
- [ ] Configure analytics and CRM webhook, if used.
- [ ] Create the production administrator account and rotate temporary credentials.
- [ ] Run the customer booking and admin status-change smoke tests after deployment.
