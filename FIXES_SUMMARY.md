# Fixes summary

Исправлено:

- Убран случайный fallback автомобиля на `/booking`.
- Добавлены regression-тесты booking direct URL.
- Убраны public developer/import copy и нормализованы сохранённые car records в FileStore/PrismaStore.
- Исправлены известные смешанные кириллические/латинские артефакты в импортированных характеристиках.
- Добавлен favicon через `src/app/icon.svg`.
- Добавлены безопасные permanent redirects `/home` и старого каталога.
- Убрано предупреждение Next 16 о полном tracing media proxy.

Проверено:

- lint, typecheck, 297 тестов, production build;
- 44 car URLs из sitemap;
- Chromium, Firefox, WebKit;
- booking direct/selected car;
- mobile 320×568 и 390×844 без horizontal overflow.

Требует внимания владельца:

- заполнить и подтвердить возраст/стаж/минимальный срок для 44 persisted автомобилей;
- подтвердить SEO destination для старых `/sochi`, `/petersburg`, `/uslugi` URL;
- согласовать установку axe и полный screenshot matrix в CI/QA.
