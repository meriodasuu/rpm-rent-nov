# rpm-rent-nov
09.11.26 rpm rent vers

# RPM Rent

Многостраничный сайт сервиса аренды премиальных автомобилей в Санкт-Петербурге. Реализован основной путь «главная → каталог → карточка автомобиля → бронирование → заявка менеджеру», а также защищённая панель управления.

Фотографии в dev-каталоге взяты из публичной папки Яндекс Диска, указанной в ТЗ. Авито заблокировал автоматизированное чтение, поэтому цены и индивидуальные условия в seed отмечены как демонстрационные и не должны публиковаться без сверки.

## Stack

- Next.js 16, App Router, React 19, TypeScript strict;
- собственная responsive UI-система и Lucide Icons;
- Prisma ORM 7, PostgreSQL и `@prisma/adapter-pg`;
- Zod для серверной валидации;
- Server Actions для админки, Route Handler для заявок;
- Vitest для критической бизнес-логики;
- локальное серверное JSON-хранилище только для dev-режима без PostgreSQL.

## Local development

Требуется Node.js 22+ и pnpm 11+.

```bash
pnpm install
pnpm prisma:generate
pnpm seed
pnpm dev
```

Откройте `http://localhost:3000`. При отсутствии `DATABASE_URL` приложение автоматически использует `.data/db.json`; это серверное dev-хранилище, а не `localStorage`.

Панель: `http://localhost:3000/admin`. В подготовленном локальном `.env.local`: `admin@localhost` / `rpm-rent-dev`. Эти реквизиты существуют только для локальной проверки; файл игнорируется Git.

## Environment variables

Скопируйте `.env.example` в `.env.local` и заполните:

- `DATABASE_URL` — PostgreSQL connection string. При наличии включает Prisma-хранилище;
- `AUTH_SECRET` — случайная строка от 32 символов для подписи сессии;
- `ADMIN_EMAIL` — email администратора;
- `ADMIN_PASSWORD_HASH` — scrypt-хеш пароля;
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_MEDIA_BUCKET` — приватное Supabase Storage для фотографий из админки; service-role ключ доступен только серверу;
- `NEXT_PUBLIC_SITE_URL` — канонический origin без завершающего `/`;
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` — необязательный ID Метрики;
- `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_ADDRESS` — только подтверждённые контакты;
- `CRM_WEBHOOK_URL` — необязательный серверный webhook для копии новой заявки.
- `TELEGRAM_BOT_TOKEN` — токен бота из BotFather; хранится только на сервере;
- Заявки на аренду и лиды Яндекс.Директ бот отправляет всем активированным сотрудникам; отдельный `TELEGRAM_ALERT_CHAT_ID` для этого не нужен.
- `TELEGRAM_BOOTSTRAP_ADMINS` — usernames первых администраторов через запятую, без `@`; после первого `/start` доступ закрепляется за их Telegram ID;
- `TELEGRAM_WEBHOOK_SECRET` — случайный секрет для проверки входящих Telegram webhook-запросов.

Создание хеша:

```bash
pnpm auth:hash -- "a-long-production-password"
```

## Database and Prisma

Production-схема находится в `prisma/schema.prisma`, начальная миграция — в `prisma/migrations`.

```bash
pnpm prisma:generate
pnpm prisma:validate
pnpm prisma:deploy
pnpm seed:postgres
```

Для разработки с локальным PostgreSQL используйте `pnpm prisma:migrate`, затем `pnpm seed:postgres`. Dev seed намеренно содержит флаг `isDemo`; после переноса проверенных цен его нужно снять в админке.

## Admin

Авторизация использует HttpOnly, SameSite=Lax, HMAC-подписанную сессию и scrypt-хеш пароля. В админке доступны:

- CRUD автомобилей, публикация, наличие, цена, залог, фотографии и SEO;
- загрузка фотографий с компьютера напрямую в приватное Storage с прогрессом, выбором обложки и изменением порядка; для локаций — быстрая замена одного изображения;
- заявки, период, клиент, источник, домен оформления, расчёт и статусы;
- редактирование услуг и FAQ.

Цена автомобиля хранится один раз. Каталог, карточка, рекомендации, бронирование и серверный расчёт читают одну сущность.

## Content and images

Источник фото: `https://disk.yandex.ru/d/10Aae1ngI1Cydg`. Инвентаризация показала 12 марок, 157 папок и 1 339 файлов. В проект перенесены оптимизированные preview-версии оригинальных фотографий для восьми машин:

- Porsche 911 Carrera 4S;
- Lamborghini Urus;
- Mercedes-AMG G 63;
- BMW M4;
- Audi RS 5;
- Bentley Continental GT;
- Li Auto L6;
- Toyota GR Supra.

Seed находится в `src/data/seed.ts`. Полный архив не копируется в репозиторий (около 9,6 ГБ). Для расширения добавьте файлы в `public/images/cars/<slug>/`, затем создайте автомобиль через `/admin/cars/new`.

## Yandex Metrica

Укажите `NEXT_PUBLIC_YANDEX_METRIKA_ID`. Скрипт не загружается, если значение отсутствует. Событийная точка подготовлена в интерфейсе; перед production согласуйте имена целей в кабинете Метрики и добавьте их в клиентские действия.

## Deployment

1. Поднимите PostgreSQL и задайте production env.
2. Выполните `pnpm prisma:deploy` и `pnpm seed:postgres` только для первоначального наполнения.
3. Выполните `pnpm build` и `pnpm start` либо используйте Node-compatible платформу.
4. Снимите `isDemo` только у проверенных записей.
5. Не переносите локальный `.env.local` и `.data/db.json` в production.

## Telegram-бот заявок

1. Создайте бота через BotFather и добавьте `TELEGRAM_BOT_TOKEN` в production environment.
2. Каждый сотрудник должен открыть бота и выполнить `/start`. Администратор добавляет новых сотрудников командой `/allow @username`, после чего сотрудник также выполняет `/start`.
3. Создайте случайный `TELEGRAM_WEBHOOK_SECRET` и установите webhook после деплоя:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" -d "url=https://<DOMAIN>/api/telegram/webhook" -d "secret_token=<WEBHOOK_SECRET>" -d 'allowed_updates=["message"]'
```

Доступные команды: `/new` выводит до десяти новых заявок, `/booking <id>` — полную карточку. Новая заявка сначала сохраняется в базе и админке, затем отправляется всем активированным сотрудникам в Telegram; недоступность Telegram не мешает оформлению заявки.

## SEO redirects

Перед сменой домена экспортируйте индексируемые URL старого сайта из CMS, Яндекс Вебмастера и аналитики. Сопоставьте их с новыми адресами и заполните `src/config/redirects.ts`. Не добавляйте вымышленные редиректы: неверный 301 сложнее исправить, чем временно отсутствующий.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Перед публикацией

- заменить все demo-тарифы и условия подтверждёнными данными Авито;
- заполнить год, двигатель, мощность, коробку, привод, возраст, стаж, пробег, перепробег и страхование;
- подтвердить телефон, Telegram, адрес, режим работы и подключить карту;
- утвердить юридические реквизиты и политику конфиденциальности;
- загрузить только реальные отзывы и согласованный рейтинг;
- задать production `DATABASE_URL`, `AUTH_SECRET`, email и новый хеш пароля;
- указать production-домен и ID Яндекс Метрики;
- заполнить таблицу 301-редиректов старого сайта;
- проверить цели аналитики, webhook/CRM и резервное копирование базы.


## Quick production setup (Supabase)

Set in Vercel or hosting env:
- DATABASE_URL=postgresql://... (full DSN), or
- SUPABASE_PROJECT_REF=<your-supabase-project-ref> and SUPABASE_DB_PASSWORD=<dashboard password>.

Optional: SUPABASE_DB_USER, SUPABASE_DB_NAME, SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DATABASE_URL.

After env is set:
- pnpm env:check
- pnpm prisma:migrate
- pnpm seed:postgres
- pnpm build


## VK Реклама

Подготовлена интеграция пикселя и коротких заявок VK. Настройки, события и проверка перед включением: [docs/vk-pixel.md](docs/vk-pixel.md).
