# Рабочий доступ к серверу RPM Rent

Проверено 21.09.2026. Домены `rpmrent.ru` и `rpm-rent.ru` указывают на `91.222.239.130`; приложение находится в `/opt/rpm-rent`.

**SSH работает на порту 2222, а не 22.** Порт 22 закрывает соединение до проверки ключа. Старый IP `80.90.187.252` из локального Caddyfile не использовать для деплоя.

Проверенная команда PowerShell:

```powershell
ssh -p 2222 -o BatchMode=yes -o ConnectTimeout=15 `
  -i "$env:USERPROFILE/.ssh/rpm_rent_timeweb_20260824_ed25519" `
  -i "$env:USERPROFILE/.ssh/rpm_rent_timeweb_20260823_ed25519" `
  -i "$env:USERPROFILE/.ssh/codex_rpm_rent_timeweb_ed25519" `
  -i "$env:USERPROFILE/.ssh/id_ed25519" `
  deploy@91.222.239.130
```

Для SCP используется `-P 2222`. Ключи уже находятся локально; содержимое ключей и серверного `.env.production` не выводить.

На сервере имеются изменения Dockerfile, Compose и конфигурации, которых нет локально. Перед деплоем сравнивать файлы и переносить только изменения текущей задачи. Не заменять весь проект локальной рабочей копией. Сервисы: `app`, `caddy`, `db`, `telegram`. Для интеграции пикселя миграции БД не нужны.

## Сборка VK 21.09.2026

Из-за нехватки места при распаковке новой базовой среды очищен только Docker build cache. Все тома, рабочие контейнеры и именованные резервные образы сохранены. Сборка выполнена через серверные `Dockerfile.vk-release` и `compose.vk-release.yml`, с использованием уже имеющихся `rpm-rent-tools:latest` и `rpm-rent-app:before-vk-20260921`. Этот способ подходит для текущего изменения без обновления зависимостей. Для последующих обновлений сначала сверить зависимости. Перезапущен только `app`; миграции не выполнялись.

Предыдущий рабочий образ: `rpm-rent-app:before-vk-20260921`. Резервная копия затронутых исходников и окружения: `/opt/rpm-rent/backups/vk-pixel-*`.

## Основной домен и SEO 21.09.2026

Основной production URL — `https://rpmrent.ru`. В `.env.production` установлен соответствующий `NEXT_PUBLIC_SITE_URL`; изменение этой переменной требует пересборки, так как Next.js встраивает её в результат сборки.

Сборка без обновления зависимостей: `docker compose --env-file .env.production -f compose.production.yml -f compose.seo-release.yml build app`, запуск: `docker compose --env-file .env.production -f compose.production.yml up -d --no-deps app`. `Dockerfile.seo-release` использует имеющиеся зависимости `rpm-rent-tools:latest` и полный standalone-результат сборки.

Откат до изменения основного домена: образ `rpm-rent-app:before-seo-20260921`, резервные исходники и окружение в `/opt/rpm-rent/backups/seo-20260921T135655Z`. Дополнительная правка canonical политик и фильтров имеет отдельную резервную копию `seo-*` и образ `rpm-rent-app:before-seo-followup-20260921`. Для полного отката исходников нужно учитывать обе копии. Секреты из копий окружения не публиковать.

Caddy использует `admin off`: сначала `caddy validate`, затем перезапуск контейнера caddy. Домены `rpm-rent.ru` и `www.rpmrent.ru` перенаправляют публичные GET/HEAD на `rpmrent.ru`, сохраняя путь и параметры. Исключения для API, admin, ресурсов Next.js, robots и проверки Яндекса намеренные.

## Рекламный домен 10.10.2026

`rpm-rent.ru` обслуживает страницы напрямую без перехода на `rpmrent.ru`. Редиректы старых путей остаются на исходном домене и сохраняют рекламные параметры. `www.rpmrent.ru` по-прежнему перенаправляет публичные страницы на `rpmrent.ru`; канонический URL приложения также пока `rpmrent.ru`. Изменён только Caddyfile, приложение не пересобиралось. Резервная копия серверного Caddyfile: `/opt/rpm-rent/backups/Caddyfile-before-domain-20261010`.
