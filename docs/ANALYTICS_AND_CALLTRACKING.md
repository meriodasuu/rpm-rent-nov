# Аналитика, SEO и коллтрекинг

В проекте включены базовые SEO-настройки: title/description, canonical, Open Graph, `robots.txt`, `sitemap.xml` и JSON-LD автопроката.

## Яндекс Метрика

Заполните `NEXT_PUBLIC_YANDEX_METRIKA_ID` в production environment. Скрипт Метрики загружается только после согласия на аналитику. В кабинете Метрики создайте цели: `phone_click`, `contact_click`, `booking_open`, `booking_submit`, `catalog_open`, `date_check`.

Актуальная воронка RPM Rent:

- `Заявка отправлена` — посещение `/spasibo`; это единственная цель заявки для оптимизации поисковой рекламы.
- `booking_form_start` — первое взаимодействие с полем формы.
- `booking_submit_click` — попытка отправки формы.
- `booking_submit_error` — ошибка API или техническая ошибка отправки.
- `Клик по телефону` — `phone_click`.
- `telegram_click` и `max_click` — переходы в мессенджеры.
- `map_click` — открытие адреса на карте.
- `social_vk_click`, `social_instagram_click`, `social_tiktok_click`, `social_youtube_click`, `social_avito_click`, `social_site_click` — переходы в остальные каналы и профили.
- Составная цель: `/booking` → `booking_form_start` → `booking_submit_click` → `/spasibo`.

Страница `/spasibo` не включена в sitemap, не добавлена в меню и отдаёт `noindex,nofollow`. Она появляется только после успешного ответа API формы; прямой переход на неё не создаёт заявку.

## Источник звонка

Сайт сохраняет в сессии UTM-параметры, `yclid`, `gclid`, `fbclid`, `roistat_visit`, первую страницу входа и referrer. При отправке заявки эти данные попадают в `utm`/`referrer` и видны в админ-панели.

## Коллтрекинг

Провайдер должен предоставить готовый URL JavaScript-кода. Заполните `NEXT_PUBLIC_CALLTRACKING_SCRIPT_URL` этим URL. Телефонные ссылки помечены событием `phone_click`, чтобы связать звонок с целью аналитики. Пул номеров и правила подмены настраиваются в кабинете выбранного провайдера.
