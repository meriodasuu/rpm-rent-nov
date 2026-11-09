# RPM Rent — Media Manifest

Дата: 10 августа 2026

## Политика медиа

- Все изображения автомобилей — реальные файлы автопарка, уже находившиеся в проекте.
- AI не использован для создания, улучшения или подмены автомобиля.
- Единственный AI-asset — атмосферный фон Санкт-Петербурга без машин, людей, логотипов и текста.
- На продуктовых страницах источник и роль изображения различимы по контексту и alt-текстам.

## Реальный автопарк

Корневая директория: `public/images/cars/`

| Автомобиль | Директория | Файлов |
|---|---|---:|
| Audi RS 5 | `audi-rs5/` | 8 |
| Bentley Continental GT | `bentley-continental/` | 4 |
| BMW M4 | `bmw-m4/` | 4 |
| Lamborghini Urus | `lamborghini-urus/` | 8 |
| Li Auto L6 | `li-auto-l6/` | 4 |
| Mercedes-AMG G 63 | `mercedes-amg-g63/` | 4 |
| Porsche 911 Carrera 4S | `porsche-911-carrera-4s/` | 4 |
| Toyota GR Supra | `toyota-supra/` | 8 |
| **Всего** |  | **44** |

### Ключевые размещения

- Homepage hero: `public/images/cars/porsche-911-carrera-4s/01.jpg`.
- Catalog category entry: Porsche `01.jpg`, Lamborghini Urus `05.jpg`, Bentley `02.jpg`.
- Services hero: `public/images/cars/bentley-continental/02.jpg`.
- Car Detail: изображения только из директории выбранной модели.
- Карточки и похожие автомобили: реальные изображения соответствующих моделей.

## Сгенерированный атмосферный asset

### Файл

- Рабочая копия: `public/images/atmosphere/saint-petersburg-blue-hour.png`.
- Исходный результат ImageGen: `C:\Users\wthtw\.codex\generated_images\019fe796-f97c-7930-b09c-5740500f3dec\exec-f22e1e42-a277-4e65-8d22-386ff5db8532.png`.
- Размер исходной копии: 2 044 350 байт; на сайте отдаётся через оптимизацию `next/image`.
- Роль: настроение города на Homepage, About и Contacts.
- Ограничение: asset не является документальной фотографией конкретной точки и не используется для показа автомобиля.

### Инструмент и режим

- Инструмент: встроенный ImageGen.
- Режим: генерация нового широкого raster-изображения.
- Входные изображения: не использовались.

### Prompt

```text
Use case: photorealistic-natural
Asset type: wide atmospheric editorial website section background for a premium car rental in Saint Petersburg
Primary request: cinematic Saint Petersburg at blue hour just after rain, viewed from a low street-level perspective along a granite embankment, with restrained classical facades, wet dark stone and subtle reflections from distant deep-red city lights
Scene/backdrop: recognizable Saint Petersburg mood through granite, water, mist and historic architecture, but no single landmark presented as an exact documentary claim
Subject: atmosphere and city texture only; no vehicle is the subject
Style/medium: photorealistic premium automotive editorial photography, natural real-world texture, restrained film grain
Composition/framing: very wide landscape composition, strong depth, clean darker negative space for optional interface copy, no central hero object
Lighting/mood: cool blue hour, diffused haze, glossy rain reflections, sophisticated and quiet rather than dramatic
Color palette: graphite, black, muted stone, cold blue-gray, tiny controlled deep-red reflections
Materials/textures: wet granite, asphalt, water, aged facade stone
Constraints: no cars, no motorcycles, no people, no logos, no readable signs, no text, no watermark; do not fabricate a vehicle or imply it belongs to the fleet
Avoid: neon cyberpunk, postcard saturation, fantasy architecture, oversharpening, excessive red, generic Dubai-like luxury
```

## AI_MEDIA_BRIEF

`AI_MEDIA_BRIEF.md` не создавался: необходимый атмосферный asset успешно сгенерирован, сохранён локально и интегрирован в production-код.

