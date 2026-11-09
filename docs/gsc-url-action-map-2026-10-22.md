# Карта URL из Google Search Console

**Источник:** выгрузки GSC от 21.10.2026, отчёт обновлён 12.10.2026.  
**Назначение:** подготовка решений по старым URL; правила на сервере не менялись.

## 1. Просканированы, но не проиндексированы — 24 URL

| Группа | Кол-во | Решение |
|---|---:|---|
| Текущая коммерческая страница `/rental-terms` | 1 | Улучшить содержание и внутренние ссылки, затем отправить на переобход. Не закрывать. |
| Favicon с параметром | 1 | Не индексировать; это нормальное техническое состояние. |
| Старые WordPress author/category/feed URL | 3 | Не восстанавливать; проверить, что они возвращают 404/410 и не входят в sitemap. |
| Старые страницы автомобилей Петербурга | 17 | Сверить с картой 404 ниже: 301 только при точном актуальном соответствии. |
| Старые страницы Сочи | 2 | Оставить 404/410: услуга в Сочи не подтверждена. |

`/rental-terms` — единственный URL из выборки, который нужно продвигать. После релиза SEO-правок Google сканировал его 13.10, поэтому повторный запрос на переобход делать после содержательных улучшений, а не вместо них.

## 2. Старые 404 — 60 URL

### Готовы к точному 301 после решения владельца

| Старый URL | Целевой URL | Основание |
|---|---|---|
| `/kontakty/` | `/contacts` | Та же страница контактов. |
| `/politika-konfidenczialnosti/` | `/privacy` | Та же политика конфиденциальности. |
| `/uslugi/` | `/services` | Та же страница услуг. |
| `/o-nas/` | `/about` | Та же страница о компании. |
| `/petersburg/avtomobili/` | `/cars` | Старый каталог → текущий каталог. |
| `/petersburg/arenda-porsche/arenda-porsche-panamera/` | `/cars/porsche-panamera-4-2019` | Та же модельная потребность. |
| `/petersburg/arenda-bmw/arenda-bmw-m5/` | `/cars/bmw-m5-2021` | Та же модельная потребность. |
| `/petersburg/arenda-bmw/bmw-420d/` | `/cars/bmw-420d-2016` | Та же модельная потребность. |
| `/petersburg/arenda-mercedes/arenda-mercedes-c43-amg/` | `/cars/mercedes-benz-c-43-amg-2018` | Та же модельная потребность. |
| `/petersburg/arenda-mercedes/arenda-mercedes-e53-amg/` | `/cars/mercedes-benz-e-53-amg-2020` | Та же модельная потребность. |
| `/petersburg/arenda-mercedes/mercedes-e220d-4matic/` | `/cars/mercedes-benz-e-220d-2020` | Та же модельная потребность. |
| `/petersburg/arenda-mercedes/arenda-mercedes-ml63-amg/` | `/cars/mercedes-benz-ml-63-amg-2013` | Та же модельная потребность. |
| `/petersburg/arenda-mercedes/arenda-mercedes-g63-amg/` | **требуется выбрать один URL G63** | В sitemap есть две карточки G63; сначала убрать дублирование карточек. |

### Нужна проверка фактической услуги или автомобиля

| Старый URL / группа | Возможная страница | Почему нельзя включать автоматически |
|---|---|---|
| `/petersburg/arenda-porsche/`, `/petersburg/arenda-porsche/arenda-porsche-cayenne/`, `...cayenne-2/` | `/cars`, либо отдельная подборка Porsche после подтверждения | Сейчас нет страницы марки Porsche; два Cayenne в каталоге, неизвестна историческая модель. |
| `/petersburg/arenda-bmw/arenda-bmw-x5-30d-copy/`, `...x5-40e/` | `/cars/bmw-x5-2020` или `/cars/bmw-x5-2022` | Год и версия старого авто не подтверждены. |
| `/petersburg/arenda-mercedes/arenda-mercedes-s-class/` | `/cars/mercedes-benz-s-450-l-2018` или `/cars/mercedes-benz-s-450-2019` | Нужен выбор фактической модели. |
| `/petersburg/arenda-mercedes/arenda-mercedes-e300/`, `...gle350/`, `...cla-45-amg/` | — | Точного действующего автомобиля в sitemap нет. |
| `/petersburg/arenda-bmw/arenda-bmw-x6-30d/`, `...525dx/`, `...640dx/`, `...540ix/` | — | Точного действующего автомобиля в sitemap нет. |
| `/petersburg/arenda-bmw/arenda-bmw-320dx*`, `bmw-420d-grey/`, `bmw-520d-g30/` | — | Несколько старых версий; нельзя направлять на иной автомобиль без решения владельца. |
| `/petersburg/arenda-range-rover/*`, `/petersburg/arenda-lexus/*`, `/petersburg/arenda-ford/*`, `/petersburg/arenda-lixiang/*` | — | Моделей нет в текущем предложении либо нет точного соответствия. |
| `/uslugi/arenda-avto-biznes-klassa/`, `/uslugi/arenda-vnedorozhnikov/`, `/uslugi/arenda-sportivnyh-avto/` | `/cars` или будущие подборки | Нет самостоятельных полезных посадочных страниц в текущей структуре. |
| `/uslugi/arenda-avto-dlya-videosyomki/`, `/uslugi/arenda-avto-na-meropriyatie/` | `/services` | Услуги упомянуты, но условия и доступные авто не подтверждены. |
| `/klientam/`, `/klientam/tarify/`, `/klientam/pravila-arendy/` | `/rental-terms` | Нужна сверка исторического содержания и актуальных условий. |

### Оставить 404/410

| Группа | URL |
|---|---|
| Сочи, если город больше не обслуживается | `/sochi/`, `/sochi/kontakty/`, `/sochi/klientam/`, `/sochi/klientam/otzyvy/`, `/sochi/klientam/tarify/`, `/sochi/klientam/pravila-arendy/`, `/sochi/uslugi/*`, `/sochi/arenda-bmw/*` |
| Удалённый блог, статьи, рубрики, авторы и feeds | `/blog/`, `/statya-2/`, `/statya-3/`, `/blog/2021/07/23/exploring-atlantas-modern-homes/`, `/category/*`, `/author/adminvpn*` |
| Технический мусор и отсутствующий контент | `/-/empty/`, `/static3.tildacdn.com/`, `/css/fonts-tildasans`, `/petersburg/arenda-lexus/`, `/petersburg/arenda-toyota/`, `/petersburg/arenda-ford/` |
| Отзывы, если их нет на текущем сайте | `/klientam/otzyvy/`, `/sochi/klientam/otzyvy/` |

## Последствия и порядок внедрения

1. Включать только строку из блока «готовы к точному 301», сохраняя путь к конкретной тематически совпадающей странице.
2. Не направлять старые автомобили, Сочи, блог, отзывы или технические URL на `/cars` либо главную: это создаст soft 404.
3. Перед запуском проверить в Метрике и Директе входы на старые URL. Доступа к Директу пока нет, поэтому правила не включены.
4. После запуска проверить цепочки 301 и запросить в GSC проверку исправления только для фактически устранённых URL.
