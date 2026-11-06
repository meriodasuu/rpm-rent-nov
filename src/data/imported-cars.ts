import type { Car } from "@/types/domain";
import { vehicleClassForCar } from "@/lib/vehicle-class";

const importedCarRecords: Car[] = [
  {
    "id": "car-bmw-m8-2021",
    "slug": "bmw-m8-2021",
    "brand": "BMW",
    "model": "M8",
    "title": "BMW M8",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2021,
    "transmission": null,
    "engine": "4.4 xDrive Steptronic (625 л.с.)",
    "horsepower": 625,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW M8, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW M8, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 35000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: F91/F92 (2019—2022)",
      "Комплектация: Competition",
      "Разгон: 0–100 км/ч — всего 3.2 сек"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 100,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2Fbecf07345943db239486dcf659ce7f67_9fe8159e_69f5_47bb_a852_1df8a03ec83d.png",
        "alt": "BMW M8 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2FUntitled53_20260409003135%20(1).png",
        "alt": "BMW M8 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2FUntitled53_20260409003622%20(1).png",
        "alt": "BMW M8 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2FUntitled53_20260409004055%20(1).png",
        "alt": "BMW M8 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2FUntitled53_20260409004447%20(1).png",
        "alt": "BMW M8 — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C8_150%2F%D0%98%D0%98%2FUntitled53_20260409005156%20(1).png",
        "alt": "BMW M8 — фото 6"
      }
    ],
    "seoTitle": "BMW M8 в аренду — RPM Rent",
    "seoDescription": "BMW M8, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-m5-2021",
    "slug": "bmw-m5-2021",
    "brand": "BMW",
    "model": "M5",
    "title": "BMW M5",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2021,
    "transmission": null,
    "engine": "4.4 xDrive AT",
    "horsepower": 625,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW M5, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW M5, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 35000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: F90 рестайлинг (2020—2025)",
      "Комплектация: Сompetition"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 101,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C5_556%2F%D0%98%D0%98%2FM5_1.jpg",
        "alt": "BMW M5 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C5_556%2F%D0%98%D0%98%2FM5_2.jpg",
        "alt": "BMW M5 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C5_556%2F%D0%98%D0%98%2FM5_3..jpg",
        "alt": "BMW M5 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C5_556%2F%D0%98%D0%98%2FM5_4.jpg",
        "alt": "BMW M5 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%9C5_556%2F%D0%98%D0%98%2FM5_5.jpg",
        "alt": "BMW M5 — фото 5"
      }
    ],
    "seoTitle": "BMW M5 в аренду — RPM Rent",
    "seoDescription": "BMW M5, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-x5-2022",
    "slug": "bmw-x5-2022",
    "brand": "BMW",
    "model": "X5",
    "title": "BMW X5",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2022,
    "transmission": null,
    "engine": "30Ld 3.0 xDrive Steptronic",
    "horsepower": 480,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW X5, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW X5, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 25000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G18 (2022—2023)",
      "Комплектация: Base"
    ],
    "rentalConditions": [
      "12 часов — 22 000 ₽",
      "3–7 суток — 23 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 102,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_08.png",
        "alt": "BMW X5 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_13.png",
        "alt": "BMW X5 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_16.png",
        "alt": "BMW X5 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_21.png",
        "alt": "BMW X5 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_23.png",
        "alt": "BMW X5 — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_26.png",
        "alt": "BMW X5 — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_39.png",
        "alt": "BMW X5 — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_290%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_18_48.png",
        "alt": "BMW X5 — фото 8"
      }
    ],
    "seoTitle": "BMW X5 2022 в аренду в Санкт-Петербурге",
    "seoDescription": "BMW X5, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-x7-2019",
    "slug": "bmw-x7-2019",
    "brand": "BMW",
    "model": "X7",
    "title": "BMW X7",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "40i 3.0 xDrive Steptronic (340 л.с.)",
    "horsepower": 340,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW X7, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW X7, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 22000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G07 (2018—2022)",
      "Комплектация: M Sport Pro"
    ],
    "rentalConditions": [
      "12 часов — 17 000 ₽",
      "3–7 суток — 20 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 103,
    "images": [],
    "seoTitle": "BMW X7 в аренду — RPM Rent",
    "seoDescription": "BMW X7, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-540i-2019",
    "slug": "bmw-540i-2019",
    "brand": "BMW",
    "model": "540i",
    "title": "BMW 540i",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "540i 3.0 xDrive Steptronic (340 л.с.)",
    "horsepower": 340,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW 540i, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW 540i, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 15000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G30/G31 (2016—2020)",
      "Комплектация: M Sport Pro",
      "Разгон: дo 100 км/ч зaнимaет окoлo 4,7–4,8"
    ],
    "rentalConditions": [
      "12 часов — 13 000 ₽",
      "3–7 суток — 14 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 104,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F540i%20_552%2F%D0%98%D0%98%2FUntitled124_20260517022503.png",
        "alt": "BMW 540i — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F540i%20_552%2F%D0%98%D0%98%2FUntitled124_20260517022547.png",
        "alt": "BMW 540i — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F540i%20_552%2F%D0%98%D0%98%2FUntitled124_20260517022656.png",
        "alt": "BMW 540i — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F540i%20_552%2F%D0%98%D0%98%2FUntitled124_20260517022857.png",
        "alt": "BMW 540i — фото 4"
      }
    ],
    "seoTitle": "BMW 540i в аренду — RPM Rent",
    "seoDescription": "BMW 540i, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-x5-2020",
    "slug": "bmw-x5-2020",
    "brand": "BMW",
    "model": "X5",
    "title": "BMW X5",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "30d 3.0 xDrive Steptronic (265 л.с.)",
    "horsepower": 265,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW X5, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW X5, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 15000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G05 (2018—2023)",
      "Комплектация: Base"
    ],
    "rentalConditions": [
      "12 часов — 12 000 ₽",
      "3–7 суток — 14 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 105,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_518%2F%D0%98%D0%98%2FUntitled99_20260501012404.png",
        "alt": "BMW X5 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_518%2F%D0%98%D0%98%2FUntitled99_20260501013414.png",
        "alt": "BMW X5 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_518%2F%D0%98%D0%98%2FUntitled99_20260501015010.png",
        "alt": "BMW X5 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_518%2F%D0%98%D0%98%2FUntitled99_20260501023254.png",
        "alt": "BMW X5 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A55_518%2F%D0%98%D0%98%2FUntitled99_20260501025657.png",
        "alt": "BMW X5 — фото 5"
      }
    ],
    "seoTitle": "BMW X5 2020 в аренду в Санкт-Петербурге",
    "seoDescription": "BMW X5, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-x6-2016",
    "slug": "bmw-x6-2016",
    "brand": "BMW",
    "model": "X6",
    "title": "BMW X6",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2016,
    "transmission": null,
    "engine": "30d 3.0 Steptronic (249 л.с.)",
    "horsepower": 249,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW X6, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW X6, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 12000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: F16 (2014—2020)",
      "Комплектация: Luxury"
    ],
    "rentalConditions": [
      "12 часов — 10 000 ₽",
      "3–7 суток — 11 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 106,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A56_858%2F%D0%98%D0%98%2Fhf_20260504_193735_04445454-7c4e-4bf4-977d-a98ca1979799.png",
        "alt": "BMW X6 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A56_858%2F%D0%98%D0%98%2FUntitled108_20260505011148.png",
        "alt": "BMW X6 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A56_858%2F%D0%98%D0%98%2FUntitled108_20260505012721.png",
        "alt": "BMW X6 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F%D0%A56_858%2F%D0%98%D0%98%2FUntitled108_20260505020637.png",
        "alt": "BMW X6 — фото 4"
      }
    ],
    "seoTitle": "BMW X6 в аренду — RPM Rent",
    "seoDescription": "BMW X6, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-320d-2021",
    "slug": "bmw-320d-2021",
    "brand": "BMW",
    "model": "320d",
    "title": "BMW 320d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2021,
    "transmission": null,
    "engine": "320d 2.0 xDrive AT (190 л.с.)",
    "horsepower": 190,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW 320d, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW 320d, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 10000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G20/G21 (2018—2023)",
      "Комплектация: M Sport Pure"
    ],
    "rentalConditions": [
      "12 часов — 8 000 ₽",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 107,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320D_261%2F%D0%98%D0%98%2FUntitled77_20260416112218.png",
        "alt": "BMW 320d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320D_261%2F%D0%98%D0%98%2FUntitled77_20260416112709.png",
        "alt": "BMW 320d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320D_261%2F%D0%98%D0%98%2FUntitled77_20260416113328.png",
        "alt": "BMW 320d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320D_261%2F%D0%98%D0%98%2FUntitled77_20260416113755.png",
        "alt": "BMW 320d — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320D_261%2F%D0%98%D0%98%2FUntitled77_20260416114620.png",
        "alt": "BMW 320d — фото 5"
      }
    ],
    "seoTitle": "BMW 320d 2021 в аренду в Санкт-Петербурге",
    "seoDescription": "BMW 320d, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-530d-2018",
    "slug": "bmw-530d-2018",
    "brand": "BMW",
    "model": "530d",
    "title": "BMW 530d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2018,
    "transmission": null,
    "engine": "530d 3.0 xDrive Steptronic (249 л.с.)",
    "horsepower": 249,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW 530d, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW 530d, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 9000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: G30/G31 (2016—2020)",
      "Комплектация: M Sport"
    ],
    "rentalConditions": [
      "12 часов — 7 000 ₽",
      "3–7 суток — 8 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 108,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F530D_368%2F%D0%98%D0%98%2FUntitled124_20260517021955.png",
        "alt": "BMW 530d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F530D_368%2F%D0%98%D0%98%2FUntitled124_20260517022040.png",
        "alt": "BMW 530d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F530D_368%2F%D0%98%D0%98%2FUntitled124_20260517022143.png",
        "alt": "BMW 530d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F530D_368%2F%D0%98%D0%98%2FUntitled124_20260517022252.png",
        "alt": "BMW 530d — фото 4"
      }
    ],
    "seoTitle": "BMW 530d в аренду — RPM Rent",
    "seoDescription": "BMW 530d, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-420d-2016",
    "slug": "bmw-420d-2016",
    "brand": "BMW",
    "model": "420d",
    "title": "BMW 420d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2016,
    "transmission": null,
    "engine": "420d 2.0 AT (184 л.с.)",
    "horsepower": 184,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW 420d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW 420d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 9000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: F32/F33 (2013—2017)",
      "Комплектация: Luxury + M performance"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "3–7 суток — 8 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 109,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F420D_778%2F%D0%98%D0%98%2FUntitled163_20260613211901.png",
        "alt": "BMW 420d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F420D_778%2F%D0%98%D0%98%2FUntitled163_20260613212132.png",
        "alt": "BMW 420d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F420D_778%2F%D0%98%D0%98%2FUntitled163_20260613212558.png",
        "alt": "BMW 420d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F420D_778%2F%D0%98%D0%98%2FUntitled163_20260613213512.png",
        "alt": "BMW 420d — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F420D_778%2F%D0%98%D0%98%2FUntitled163_20260613214848.png",
        "alt": "BMW 420d — фото 5"
      }
    ],
    "seoTitle": "BMW 420d в аренду — RPM Rent",
    "seoDescription": "BMW 420d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-bmw-320d-2016",
    "slug": "bmw-320d-2016",
    "brand": "BMW",
    "model": "320d",
    "title": "BMW 320d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2016,
    "transmission": null,
    "engine": "320d 2.0 xDrive Steptronic (190 л.с.)",
    "horsepower": 190,
    "driveType": null,
    "seats": null,
    "shortDescription": "BMW 320d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "BMW 320d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 8000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: F30/F31 рестайлинг (2015—2020)",
      "Комплектация: Luxury Line"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "3–7 суток — 7 500 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 110,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320dx_314%2F%D0%98%D0%98%2FUntitled164_20260613230435.png",
        "alt": "BMW 320d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320dx_314%2F%D0%98%D0%98%2FUntitled164_20260613230727.png",
        "alt": "BMW 320d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320dx_314%2F%D0%98%D0%98%2FUntitled164_20260613231029.png",
        "alt": "BMW 320d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320dx_314%2F%D0%98%D0%98%2FUntitled164_20260613231411.png",
        "alt": "BMW 320d — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FBMW%2F320dx_314%2F%D0%98%D0%98%2FUntitled164_20260613231853.png",
        "alt": "BMW 320d — фото 5"
      }
    ],
    "seoTitle": "BMW 320d 2016 в аренду в Санкт-Петербурге",
    "seoDescription": "BMW 320d, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-dodge-challenger-2019",
    "slug": "dodge-challenger-2019",
    "brand": "Dodge",
    "model": "Challenger",
    "title": "Dodge Challenger",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "3.6 4WD AT (309 л.с.)",
    "horsepower": 309,
    "driveType": null,
    "seats": null,
    "shortDescription": "Dodge Challenger, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Dodge Challenger, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 13000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: III рестайлинг 2 (2014—2026)",
      "Комплектация: Базовая"
    ],
    "rentalConditions": [
      "12 часов — 10 000 ₽",
      "3–7 суток — 12 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 111,
    "images": [
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled113_20260507233831.png",
        "alt": "Dodge Challenger — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled113_20260508002954.png",
        "alt": "Dodge Challenger — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled114_20260509201124.png",
        "alt": "Dodge Challenger — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled114_20260509223846.png",
        "alt": "Dodge Challenger — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled114_20260509224019.png",
        "alt": "Dodge Challenger — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2F%20Dodge%20challenger%2F%D0%98%D0%98%2FUntitled114_20260509224303.png",
        "alt": "Dodge Challenger — фото 6"
      }
    ],
    "seoTitle": "Dodge Challenger в аренду — RPM Rent",
    "seoDescription": "Dodge Challenger, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-hyundai-palisade-2022",
    "slug": "hyundai-palisade-2022",
    "brand": "Hyundai",
    "model": "Palisade",
    "title": "Hyundai Palisade",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2022,
    "transmission": null,
    "engine": "2.2 CRDi 4WD AT (200 л.с.)",
    "horsepower": 200,
    "driveType": null,
    "seats": null,
    "shortDescription": "Hyundai Palisade, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Hyundai Palisade, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 12000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I рестайлинг (2022—2025)"
    ],
    "rentalConditions": [
      "12 часов — 8 000 ₽",
      "3–7 суток — 10 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 112,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2012_56_43.png",
        "alt": "Hyundai Palisade — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_00_06.png",
        "alt": "Hyundai Palisade — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_02_04.png",
        "alt": "Hyundai Palisade — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_18_21.png",
        "alt": "Hyundai Palisade — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_18_26.png",
        "alt": "Hyundai Palisade — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_20_22.png",
        "alt": "Hyundai Palisade — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_31_15.png",
        "alt": "Hyundai Palisade — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FHyundai%2FPalisade%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_32_35.png",
        "alt": "Hyundai Palisade — фото 8"
      }
    ],
    "seoTitle": "Hyundai Palisade в аренду — RPM Rent",
    "seoDescription": "Hyundai Palisade, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-maserati-ghibli-2017",
    "slug": "maserati-ghibli-2017",
    "brand": "Maserati",
    "model": "Ghibli",
    "title": "Maserati Ghibli",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2017,
    "transmission": null,
    "engine": "3.0 4WD AT (410 л.с.)",
    "horsepower": 410,
    "driveType": null,
    "seats": null,
    "shortDescription": "Maserati Ghibli, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Maserati Ghibli, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 15000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: III рестайлинг (2016—2020)",
      "Комплектация: S Q4"
    ],
    "rentalConditions": [
      "12 часов — 11 000 ₽",
      "3–7 суток — 13 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 113,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMaserati%2FGhibli%20SQ4_600%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F13_20260713222935.png",
        "alt": "Maserati Ghibli — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMaserati%2FGhibli%20SQ4_600%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F15_20260713223540.png",
        "alt": "Maserati Ghibli — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMaserati%2FGhibli%20SQ4_600%2F%D0%98%D0%98%2FUntitled186_20260714001606.png",
        "alt": "Maserati Ghibli — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMaserati%2FGhibli%20SQ4_600%2F%D0%98%D0%98%2FUntitled186_20260714003826.png",
        "alt": "Maserati Ghibli — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMaserati%2FGhibli%20SQ4_600%2F%D0%98%D0%98%2FUntitled186_20260714004027.png",
        "alt": "Maserati Ghibli — фото 5"
      }
    ],
    "seoTitle": "Maserati Ghibli в аренду — RPM Rent",
    "seoDescription": "Maserati Ghibli, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-amg-g-63-2021",
    "slug": "mercedes-benz-amg-g-63-2021",
    "brand": "Mercedes-Benz",
    "model": "AMG G 63",
    "title": "Mercedes-Benz AMG G 63",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2021,
    "transmission": null,
    "engine": "G 63 AMG 4.0 4MATIC 9G-Tronic (585 л.с.)",
    "horsepower": 585,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz AMG G 63, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz AMG G 63, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 45000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W463 (2018—2025)",
      "Комплектация: AMG G 63",
      "Разгон: 0–100 км/ч — 4.5 сек"
    ],
    "rentalConditions": [
      "12 часов — 40 000 ₽",
      "3–7 суток — 43 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 114,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled110_20260505045001.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled110_20260505050117.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled110_20260505052429.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled110_20260505053809.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled110_20260505061958.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FG63_638%2F%D0%98%D0%98%2FUntitled111_20260505065820.png",
        "alt": "Mercedes-Benz AMG G 63 — фото 6"
      }
    ],
    "seoTitle": "Mercedes-Benz AMG G 63 в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz AMG G 63, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-e-63-s-amg-2017",
    "slug": "mercedes-benz-e-63-s-amg-2017",
    "brand": "Mercedes-Benz",
    "model": "E 63 S AMG",
    "title": "Mercedes-Benz E 63 S AMG",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2017,
    "transmission": null,
    "engine": ": E 63S AMG 4.0 4MATIC 9G-Tronic (612 л.с.)",
    "horsepower": 612,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz E 63 S AMG, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz E 63 S AMG, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 30000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W213/S213/C238/A238 (2016—2020)",
      "Комплектация: Base",
      "Разгон: (0–100 км/ч): от 3,2"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 115,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9563S_180%2F%D0%98%D0%98%2FUntitled149_20260608231710.png",
        "alt": "Mercedes-Benz E 63 S AMG — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9563S_180%2F%D0%98%D0%98%2FUntitled150_20260608235936.png",
        "alt": "Mercedes-Benz E 63 S AMG — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9563S_180%2F%D0%98%D0%98%2FUntitled151_20260609001930.png",
        "alt": "Mercedes-Benz E 63 S AMG — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9563S_180%2F%D0%98%D0%98%2FUntitled151_20260609003442.png",
        "alt": "Mercedes-Benz E 63 S AMG — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9563S_180%2F%D0%98%D0%98%2FUntitled152_20260609024157.png",
        "alt": "Mercedes-Benz E 63 S AMG — фото 5"
      }
    ],
    "seoTitle": "Mercedes-Benz E 63 S AMG в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz E 63 S AMG, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-c-63-amg-2016",
    "slug": "mercedes-benz-c-63-amg-2016",
    "brand": "Mercedes-Benz",
    "model": "C 63 AMG",
    "title": "Mercedes-Benz C 63 AMG",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2016,
    "transmission": null,
    "engine": "C 63 4.0 7G-Tronic (510 л.с.)",
    "horsepower": 510,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz C 63 AMG, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz C 63 AMG, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 25000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W205/S205/C205/A205 (2014—2018)",
      "Комплектация: Base",
      "Разгон: 0–100 км/ч: всего 3.9 секунды!"
    ],
    "rentalConditions": [
      "12 часов — 20 000 ₽",
      "3–7 суток — 23 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 116,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2F8e091b857ac2a5c92ec6b30c473e4803_0ba7a624_bbf1_42cf_96c1_751c01e6aa83.jpg",
        "alt": "Mercedes-Benz C 63 AMG — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2F2874e27c6cdc44367d169471ce8c9e9f_e2c8bbef_013b_4df9_be01_242bc8e70833.jpg",
        "alt": "Mercedes-Benz C 63 AMG — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F17_20260713231814.png",
        "alt": "Mercedes-Benz C 63 AMG — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F18_20260713232444.png",
        "alt": "Mercedes-Benz C 63 AMG — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F21_20260713235931.png",
        "alt": "Mercedes-Benz C 63 AMG — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2FIMG_20260713_233747_362.png",
        "alt": "Mercedes-Benz C 63 AMG — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2FIMG_20260714_002527_127.jpeg",
        "alt": "Mercedes-Benz C 63 AMG — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A163S_219%2F%D0%98%D0%98%2FUntitled187_20260714011500.png",
        "alt": "Mercedes-Benz C 63 AMG — фото 8"
      }
    ],
    "seoTitle": "Mercedes-Benz C 63 AMG в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz C 63 AMG, 2016 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-amg-gt-50-2019",
    "slug": "mercedes-benz-amg-gt-50-2019",
    "brand": "Mercedes-Benz",
    "model": "AMG GT 50",
    "title": "Mercedes-Benz AMG GT 50",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "AMG GT 50 3.0 9G-Tronic",
    "horsepower": 367,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz AMG GT 50, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz AMG GT 50, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 20000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: C190/R190/X290 рестайлинг (2017—2026)",
      "Комплектация: GT 50"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 117,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGT43_890%2F%D0%98%D0%98%2FUntitled77_20260416130220.png",
        "alt": "Mercedes-Benz AMG GT 50 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGT43_890%2F%D0%98%D0%98%2FUntitled77_20260416132052.png",
        "alt": "Mercedes-Benz AMG GT 50 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGT43_890%2F%D0%98%D0%98%2FUntitled77_20260416135506.png",
        "alt": "Mercedes-Benz AMG GT 50 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGT43_890%2F%D0%98%D0%98%2FUntitled77_20260416140859.png",
        "alt": "Mercedes-Benz AMG GT 50 — фото 4"
      }
    ],
    "seoTitle": "Mercedes-Benz AMG GT 50 в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz AMG GT 50, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-e-53-amg-2020",
    "slug": "mercedes-benz-e-53-amg-2020",
    "brand": "Mercedes-Benz",
    "model": "E 53 AMG",
    "title": "Mercedes-Benz E 53 AMG",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "53 AMG 3.0 4MATIC 9G-Tronic",
    "horsepower": 435,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz E 53 AMG, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz E 53 AMG, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 18000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W213/S213/C238/A238 (2016—2020)",
      "Комплектация: Особая Серия",
      "Разгон: 0–100 км/ч — около 4.5 сек"
    ],
    "rentalConditions": [
      "12 часов — 15 000 ₽",
      "3–7 суток — 16 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 118,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9553_493%2F%D0%98%D0%98%2FUntitled129_20260521004912.png",
        "alt": "Mercedes-Benz E 53 AMG — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9553_493%2F%D0%98%D0%98%2FUntitled129_20260521010302.png",
        "alt": "Mercedes-Benz E 53 AMG — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%9553_493%2F%D0%98%D0%98%2FUntitled129_20260521012733.png",
        "alt": "Mercedes-Benz E 53 AMG — фото 3"
      }
    ],
    "seoTitle": "Mercedes-Benz E 53 AMG в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz E 53 AMG, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-s-450-l-2018",
    "slug": "mercedes-benz-s-450-l-2018",
    "brand": "Mercedes-Benz",
    "model": "S 450 L",
    "title": "Mercedes-Benz S 450 L",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2018,
    "transmission": null,
    "engine": "S 450 L 3.0 4MATIC 9G-Tronic (367 л.с.",
    "horsepower": 367,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz S 450 L, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz S 450 L, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 18000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W222/C217/A217 рестайлинг (2017—2020)",
      "Комплектация: Base",
      "Разгон: до 100 км/ч: Всего 4.9 секунды"
    ],
    "rentalConditions": [
      "12 часов — 15 000 ₽",
      "3–7 суток — 16 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 119,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F2_20260713175233.png",
        "alt": "Mercedes-Benz S 450 L — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F4_20260713174356.png",
        "alt": "Mercedes-Benz S 450 L — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F7_20260713185834.png",
        "alt": "Mercedes-Benz S 450 L — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F10_20260713192220.png",
        "alt": "Mercedes-Benz S 450 L — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2F%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F12_20260713205952.png",
        "alt": "Mercedes-Benz S 450 L — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS_W222_681%2F%D0%98%D0%98%2FUntitled182_20260713211522.png",
        "alt": "Mercedes-Benz S 450 L — фото 6"
      }
    ],
    "seoTitle": "Mercedes-Benz S 450 L в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz S 450 L, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-c-43-amg-2018",
    "slug": "mercedes-benz-c-43-amg-2018",
    "brand": "Mercedes-Benz",
    "model": "C 43 AMG",
    "title": "Mercedes-Benz C 43 AMG",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2018,
    "transmission": null,
    "engine": "C 43 AMG 3.0 4MATIC 9G-Tronic (390 л.с.)",
    "horsepower": 390,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz C 43 AMG, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz C 43 AMG, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 18000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W205/S205/C205/A205 рестайлинг (2018—2022)",
      "Комплектация: Особая Серия"
    ],
    "rentalConditions": [
      "Тариф на 12 часов не указан",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 120,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A143_357%2F%D0%98%D0%98%2FUntitled162_20260613172557.png",
        "alt": "Mercedes-Benz C 43 AMG — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A143_357%2F%D0%98%D0%98%2FUntitled162_20260613202606.png",
        "alt": "Mercedes-Benz C 43 AMG — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A143_357%2F%D0%98%D0%98%2FUntitled162_20260613203425.png",
        "alt": "Mercedes-Benz C 43 AMG — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%A143_357%2F%D0%98%D0%98%2FUntitled162_20260613211143.png",
        "alt": "Mercedes-Benz C 43 AMG — фото 4"
      }
    ],
    "seoTitle": "Mercedes-Benz C 43 AMG в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz C 43 AMG, 2018 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-gle-400d-2020",
    "slug": "mercedes-benz-gle-400d-2020",
    "brand": "Mercedes-Benz",
    "model": "GLE 400d",
    "title": "Mercedes-Benz GLE 400d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "GLE 400d 2.9 4MATIC 9G-Tronic (330 л.с.)",
    "horsepower": 330,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz GLE 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz GLE 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 16000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: V167 (2018—2026)",
      "Комплектация: Sport"
    ],
    "rentalConditions": [
      "12 часов — 13 000 ₽",
      "Тариф на 3–7 суток не указан"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 121,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGLE_166%2F%D0%98%D0%98%2FUntitled77_20260416121957.png",
        "alt": "Mercedes-Benz GLE 400d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGLE_166%2F%D0%98%D0%98%2FUntitled77_20260416122356.png",
        "alt": "Mercedes-Benz GLE 400d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGLE_166%2F%D0%98%D0%98%2FUntitled77_20260416122807%20(1).png",
        "alt": "Mercedes-Benz GLE 400d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FGLE_166%2F%D0%98%D0%98%2FUntitled77_20260416125023.png",
        "alt": "Mercedes-Benz GLE 400d — фото 4"
      }
    ],
    "seoTitle": "Mercedes-Benz GLE 400d в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz GLE 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-s-450-2019",
    "slug": "mercedes-benz-s-450-2019",
    "brand": "Mercedes-Benz",
    "model": "S 450",
    "title": "Mercedes-Benz S 450",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "S 450 3.0 4MATIC 9G-Tronic (367 л.с.)",
    "horsepower": 367,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz S 450, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz S 450, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 16000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W222/C217/A217 рестайлинг (2017—2020)",
      "Комплектация: S450",
      "Разгон: 0-100 км/ч: Всего 5.5 секунды"
    ],
    "rentalConditions": [
      "12 часов — 12 000 ₽",
      "3–7 суток — 14 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 122,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS%20%D1%81oupe%20450_%20314%2F%D0%98%D0%98%2FUntitled173_20260702234851.png",
        "alt": "Mercedes-Benz S 450 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS%20%D1%81oupe%20450_%20314%2F%D0%98%D0%98%2FUntitled173_20260702235218.png",
        "alt": "Mercedes-Benz S 450 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS%20%D1%81oupe%20450_%20314%2F%D0%98%D0%98%2FUntitled173_20260702235810.png",
        "alt": "Mercedes-Benz S 450 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS%20%D1%81oupe%20450_%20314%2F%D0%98%D0%98%2FUntitled173_20260703002107.png",
        "alt": "Mercedes-Benz S 450 — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FS%20%D1%81oupe%20450_%20314%2F%D0%98%D0%98%2FUntitled173_20260703004143.png",
        "alt": "Mercedes-Benz S 450 — фото 5"
      }
    ],
    "seoTitle": "Mercedes-Benz S 450 в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz S 450, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-cls-400d-2020",
    "slug": "mercedes-benz-cls-400d-2020",
    "brand": "Mercedes-Benz",
    "model": "CLS 400d",
    "title": "Mercedes-Benz CLS 400d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "CLS 400d 2.9 4MATIC 9G-Tronic (340 л.с.)",
    "horsepower": 340,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz CLS 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz CLS 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 15000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: C257 (2017—2021)",
      "Комплектация: Sport"
    ],
    "rentalConditions": [
      "12 часов — 13 000 ₽",
      "3–7 суток — 14 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 123,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled104_20260503050840.png",
        "alt": "Mercedes-Benz CLS 400d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled104_20260503051404.png",
        "alt": "Mercedes-Benz CLS 400d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled104_20260503185348.png",
        "alt": "Mercedes-Benz CLS 400d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled105_20260504011833.png",
        "alt": "Mercedes-Benz CLS 400d — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled105_20260504013131.png",
        "alt": "Mercedes-Benz CLS 400d — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FCLS_161%2F%D0%98%D0%98%2FUntitled105_20260504013916%20(1).png",
        "alt": "Mercedes-Benz CLS 400d — фото 6"
      }
    ],
    "seoTitle": "Mercedes-Benz CLS 400d в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz CLS 400d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-ml-63-amg-2013",
    "slug": "mercedes-benz-ml-63-amg-2013",
    "brand": "Mercedes-Benz",
    "model": "ML 63 AMG",
    "title": "Mercedes-Benz ML 63 AMG",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2013,
    "transmission": null,
    "engine": ": ML 63 5.5 4MATIC 7G-Tronic (557 л.с.)",
    "horsepower": 557,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz ML 63 AMG, 2013 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz ML 63 AMG, 2013 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 15000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W166 (2011—2015)",
      "Комплектация: Особая серия",
      "Разгон: 0–100 км/ч — 5 сек"
    ],
    "rentalConditions": [
      "12 часов — 13 000 ₽",
      "3–7 суток — 14 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 124,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FML63_163%2F%D0%98%D0%98%2FUntitled161_20260613141130.png",
        "alt": "Mercedes-Benz ML 63 AMG — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FML63_163%2F%D0%98%D0%98%2FUntitled161_20260613142410.png",
        "alt": "Mercedes-Benz ML 63 AMG — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FML63_163%2F%D0%98%D0%98%2FUntitled161_20260613143319.png",
        "alt": "Mercedes-Benz ML 63 AMG — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FML63_163%2F%D0%98%D0%98%2FUntitled161_20260613144228.png",
        "alt": "Mercedes-Benz ML 63 AMG — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2FML63_163%2F%D0%98%D0%98%2FUntitled161_20260613150124.png",
        "alt": "Mercedes-Benz ML 63 AMG — фото 5"
      }
    ],
    "seoTitle": "Mercedes-Benz ML 63 AMG в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz ML 63 AMG, 2013 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-mercedes-benz-e-220d-2020",
    "slug": "mercedes-benz-e-220d-2020",
    "brand": "Mercedes-Benz",
    "model": "E 220d",
    "title": "Mercedes-Benz E 220d",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "E 220d 2.0 4MATIC 9G-Tronic (194 л.с.)",
    "horsepower": 194,
    "driveType": null,
    "seats": null,
    "shortDescription": "Mercedes-Benz E 220d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Mercedes-Benz E 220d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 10000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: W213/S213/C238/A238 (2016—2021)",
      "Комплектация: Sport Plus"
    ],
    "rentalConditions": [
      "12 часов — 7 500 ₽",
      "3–7 суток — 9 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 125,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%95220D_013%2F%D0%98%D0%98%2FUntitled93_20260429001344.png",
        "alt": "Mercedes-Benz E 220d — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%95220D_013%2F%D0%98%D0%98%2FUntitled93_20260429002136.png",
        "alt": "Mercedes-Benz E 220d — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%95220D_013%2F%D0%98%D0%98%2FUntitled93_20260429003313.png",
        "alt": "Mercedes-Benz E 220d — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FMercedes%2F%D0%95220D_013%2F%D0%98%D0%98%2FUntitled93_20260429010113.png",
        "alt": "Mercedes-Benz E 220d — фото 4"
      }
    ],
    "seoTitle": "Mercedes-Benz E 220d в аренду — RPM Rent",
    "seoDescription": "Mercedes-Benz E 220d, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-taycan-turbo-s-2021",
    "slug": "porsche-taycan-turbo-s-2021",
    "brand": "Porsche",
    "model": "Taycan Turbo S",
    "title": "Porsche Taycan Turbo S",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2021,
    "transmission": null,
    "engine": "0.0 4WD AT (761 л.с.)",
    "horsepower": 761,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Taycan Turbo S, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Taycan Turbo S, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 50000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I (2019—2025)",
      "Комплектация: Turbo S",
      "Разгон: 0–100 км/ч: Всего 2.8 секунды!"
    ],
    "rentalConditions": [
      "12 часов — 45 000 ₽",
      "3–7 суток — 47 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 126,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_003708_296.jpeg",
        "alt": "Porsche Taycan Turbo S — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_003750_084.png",
        "alt": "Porsche Taycan Turbo S — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_003919_783.png",
        "alt": "Porsche Taycan Turbo S — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_004225_323.png",
        "alt": "Porsche Taycan Turbo S — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_004337_386.jpeg",
        "alt": "Porsche Taycan Turbo S — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_004453_434.png",
        "alt": "Porsche Taycan Turbo S — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_005021_571.png",
        "alt": "Porsche Taycan Turbo S — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FTaycan%20turbo_735%2F%D0%98%D0%98%2FIMG_20260716_005804_504.png",
        "alt": "Porsche Taycan Turbo S — фото 8"
      }
    ],
    "seoTitle": "Porsche Taycan Turbo S в аренду — RPM Rent",
    "seoDescription": "Porsche Taycan Turbo S, 2021 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-cayenne-turbo-2019",
    "slug": "porsche-cayenne-turbo-2019",
    "brand": "Porsche",
    "model": "Cayenne Turbo",
    "title": "Porsche Cayenne Turbo",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "4.0 4WD AT (550 л.с.)",
    "horsepower": 550,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Cayenne Turbo, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Cayenne Turbo, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 30000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: III (2017—2023)",
      "Комплектация: Cayenne Turbo",
      "Разгон: 0–100 км/ч: 3.9 сек (пакет Sроrt Сhrоnо)"
    ],
    "rentalConditions": [
      "12 часов — 26 000 ₽",
      "3–7 суток — 28 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 127,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_49_50.png",
        "alt": "Porsche Cayenne Turbo — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_53_51.png",
        "alt": "Porsche Cayenne Turbo — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_53_55.png",
        "alt": "Porsche Cayenne Turbo — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_53_59.png",
        "alt": "Porsche Cayenne Turbo — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2013_55_56.png",
        "alt": "Porsche Cayenne Turbo — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2FChatGPT%20Image%2031%20%D0%B8%D1%8E%D0%BB%D1%8F%202026%20%D0%B3.%2C%2014_01_14.png",
        "alt": "Porsche Cayenne Turbo — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20turbo_053%2F%D0%98%D0%98%2Ftelegram-cloud-photo-size-2-5420544144452558110-w.jpg",
        "alt": "Porsche Cayenne Turbo — фото 7"
      }
    ],
    "seoTitle": "Porsche Cayenne Turbo в аренду — RPM Rent",
    "seoDescription": "Porsche Cayenne Turbo, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-panamera-4-2019",
    "slug": "porsche-panamera-4-2019",
    "brand": "Porsche",
    "model": "Panamera 4",
    "title": "Porsche Panamera 4",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2019,
    "transmission": null,
    "engine": "3.0 4WD PDK (330 л.с.)",
    "horsepower": 330,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Panamera 4, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Panamera 4, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 24000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: 971 (2016—2020)",
      "Комплектация: Panamera 4 Executive"
    ],
    "rentalConditions": [
      "12 часов — 19 000 ₽",
      "3–7 суток — 23 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 128,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FPanamera_911%2F%D0%98%D0%98%2FUntitled97_20260429043253.png",
        "alt": "Porsche Panamera 4 — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FPanamera_911%2F%D0%98%D0%98%2FUntitled97_20260429054119.png",
        "alt": "Porsche Panamera 4 — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FPanamera_911%2F%D0%98%D0%98%2FUntitled97_20260429061311.png",
        "alt": "Porsche Panamera 4 — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FPanamera_911%2F%D0%98%D0%98%2FUntitled97_20260429062633.png",
        "alt": "Porsche Panamera 4 — фото 4"
      }
    ],
    "seoTitle": "Porsche Panamera 4 в аренду — RPM Rent",
    "seoDescription": "Porsche Panamera 4, 2019 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-cayenne-gts-2017",
    "slug": "porsche-cayenne-gts-2017",
    "brand": "Porsche",
    "model": "Cayenne GTS",
    "title": "Porsche Cayenne GTS",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2017,
    "transmission": null,
    "engine": "3.6 4WD AT (440 л.с.)",
    "horsepower": 440,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Cayenne GTS, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Cayenne GTS, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 17000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: II рестайлинг (2014—2018)",
      "Комплектация: Базовая",
      "Разгон: 0–100 км/ч примерно за 4.9–5.2 ceкунды"
    ],
    "rentalConditions": [
      "12 часов — 14 000 ₽",
      "3–7 суток — 16 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 129,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20GTS_678%2F%D0%98%D0%98%2FCayenne-2..jpg",
        "alt": "Porsche Cayenne GTS — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20GTS_678%2F%D0%98%D0%98%2FCayenne.jpg",
        "alt": "Porsche Cayenne GTS — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20GTS_678%2F%D0%98%D0%98%2FUntitled124_20260517021535%20(1).png",
        "alt": "Porsche Cayenne GTS — фото 3"
      }
    ],
    "seoTitle": "Porsche Cayenne GTS в аренду — RPM Rent",
    "seoDescription": "Porsche Cayenne GTS, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-macan-2020",
    "slug": "porsche-macan-2020",
    "brand": "Porsche",
    "model": "Macan",
    "title": "Porsche Macan",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "2.0 4WD PDK (252 л.с.)",
    "horsepower": 252,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Macan, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Macan, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 14000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I рестайлинг (2018—2021)",
      "Комплектация: Macan"
    ],
    "rentalConditions": [
      "12 часов — 10 000 ₽",
      "3–7 суток — 12 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 130,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2Fmacan_472%2F%D0%98%D0%98%2FIMG_20260713_200411_020.jpg",
        "alt": "Porsche Macan — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2Fmacan_472%2F%D0%98%D0%98%2FUntitled181_20260713200552.png",
        "alt": "Porsche Macan — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2Fmacan_472%2F%D0%98%D0%98%2FUntitled181_20260713203439.png",
        "alt": "Porsche Macan — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2Fmacan_472%2F%D0%98%D0%98%2FUntitled181_20260713203634.png",
        "alt": "Porsche Macan — фото 4"
      }
    ],
    "seoTitle": "Porsche Macan в аренду — RPM Rent",
    "seoDescription": "Porsche Macan, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-porsche-cayenne-diesel-2017",
    "slug": "porsche-cayenne-diesel-2017",
    "brand": "Porsche",
    "model": "Cayenne Diesel",
    "title": "Porsche Cayenne Diesel",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2017,
    "transmission": null,
    "engine": "3.0 AT (245 л.с.)",
    "horsepower": 245,
    "driveType": null,
    "seats": null,
    "shortDescription": "Porsche Cayenne Diesel, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Porsche Cayenne Diesel, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 14000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: II рестайлинг (2014—2018)",
      "Комплектация: Platinum Edition"
    ],
    "rentalConditions": [
      "12 часов — 11 000 ₽",
      "3–7 суток — 13 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 131,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20Diesel_666%2F%D0%98%D0%98%2FUntitled99_20260429194436.png",
        "alt": "Porsche Cayenne Diesel — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20Diesel_666%2F%D0%98%D0%98%2FUntitled99_20260430005058.png",
        "alt": "Porsche Cayenne Diesel — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20Diesel_666%2F%D0%98%D0%98%2FUntitled99_20260430021015.png",
        "alt": "Porsche Cayenne Diesel — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20Diesel_666%2F%D0%98%D0%98%2FUntitled99_20260430023020.png",
        "alt": "Porsche Cayenne Diesel — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FPorsche%2FCayenne%20Diesel_666%2F%D0%98%D0%98%2FUntitled99_20260430024443.png",
        "alt": "Porsche Cayenne Diesel — фото 5"
      }
    ],
    "seoTitle": "Porsche Cayenne Diesel в аренду — RPM Rent",
    "seoDescription": "Porsche Cayenne Diesel, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-rolls-royce-wraith-2015",
    "slug": "rolls-royce-wraith-2015",
    "brand": "Rolls-Royce",
    "model": "Wraith",
    "title": "Rolls-Royce Wraith",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2015,
    "transmission": null,
    "engine": null,
    "horsepower": 632,
    "driveType": null,
    "seats": null,
    "shortDescription": "Rolls-Royce Wraith, 2015 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Rolls-Royce Wraith, 2015 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 70000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: Поколение: I (2013—2026",
      "Комплектация: Black Badge"
    ],
    "rentalConditions": [
      "12 часов — 60 000 ₽",
      "3–7 суток — 65 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 132,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2F2a70cf100a1bca6fad44ddef3b7b141a_c1f7cdaa_a865_4518_ac36_2b6f9173fef4.jpg",
        "alt": "Rolls-Royce Wraith — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2F930d1c88e22cea9418423e7457001572_5aa3d7ef_bf92_4563_ad6b_07917acc5a90.jpg",
        "alt": "Rolls-Royce Wraith — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2Fb46d91edae5d13b276f6fe9e032b0095_8f5aa233_b6be_4b89_93a6_b02cb64a298e.jpg",
        "alt": "Rolls-Royce Wraith — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2Fceca670e820d55f6b4e594dc36088175_cb4a6095_de6d_4510_bbbe_861884d36e4a.jpg",
        "alt": "Rolls-Royce Wraith — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2FIMG_20260721_223650_169.jpg",
        "alt": "Rolls-Royce Wraith — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2FUntitled196_20260721222903.jpg",
        "alt": "Rolls-Royce Wraith — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2FUntitled196_20260721223124.png",
        "alt": "Rolls-Royce Wraith — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FRolls-Royce%2F%20Wraith_235%2F%D0%98%D0%98%2FUntitled196_20260721223314.png",
        "alt": "Rolls-Royce Wraith — фото 8"
      }
    ],
    "seoTitle": "Rolls-Royce Wraith в аренду — RPM Rent",
    "seoDescription": "Rolls-Royce Wraith, 2015 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-tesla-model-3-red-2022",
    "slug": "tesla-model-3-red-2022",
    "brand": "Tesla",
    "model": "Model 3 Red",
    "title": "Tesla Model 3 Red",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2022,
    "transmission": null,
    "engine": "Long Range AWD",
    "horsepower": 498,
    "driveType": null,
    "seats": null,
    "shortDescription": "Tesla Model 3 Red, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Tesla Model 3 Red, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 10000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I (2017—2023)",
      "Комплектация: Базовая",
      "Разгон: 0–100 км/ч: 4.4 сек."
    ],
    "rentalConditions": [
      "12 часов — 8 ₽",
      "3–7 суток — 11 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 133,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F1%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F2.jpg",
        "alt": "Tesla Model 3 Red — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F3%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F4%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F5%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F6%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F7%20(1).jpg",
        "alt": "Tesla Model 3 Red — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Red%20Model%203%20238%20(2022)%2F%D0%98%D0%98%2F8.jpg",
        "alt": "Tesla Model 3 Red — фото 8"
      }
    ],
    "seoTitle": "Tesla Model 3 Red в аренду — RPM Rent",
    "seoDescription": "Tesla Model 3 Red, 2022 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-tesla-model-s-black-2017",
    "slug": "tesla-model-s-black-2017",
    "brand": "Tesla",
    "model": "Model S Black",
    "title": "Tesla Model S Black",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2017,
    "transmission": null,
    "engine": "90D",
    "horsepower": 762,
    "driveType": null,
    "seats": null,
    "shortDescription": "Tesla Model S Black, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Tesla Model S Black, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 12000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I рестайлинг (2016—2021)",
      "Комплектация: Базовая",
      "Разгон: 0–100 км/ч: ~3.8 - 4.2 секунды"
    ],
    "rentalConditions": [
      "12 часов — 10 ₽",
      "3–7 суток — 11 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 134,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F1%20%D0%A1%D0%98%D0%94%D0%A0%D0%98%D0%9C.jpg",
        "alt": "Tesla Model S Black — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F2%20%D0%B8%D1%81%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%BE%20%D0%A2%D0%95%D0%A1%D0%9B%D0%90%20%D0%91%D0%9B%D0%95%D0%9A%20.jpg",
        "alt": "Tesla Model S Black — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F3.jpg",
        "alt": "Tesla Model S Black — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F4.jpg",
        "alt": "Tesla Model S Black — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F5%20%D0%B8%D1%81%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%BE.jpg",
        "alt": "Tesla Model S Black — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F6%20%D0%B8%D1%81%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%BE%20%D0%A2%D0%95%D0%A1%D0%9B%D0%90%20%D0%91%D0%9B%D0%95%D0%9A.jpg",
        "alt": "Tesla Model S Black — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F7.jpg",
        "alt": "Tesla Model S Black — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%20S%20762%20(2017)%2F%D0%98%D0%98%2F8%20(1).jpg",
        "alt": "Tesla Model S Black — фото 8"
      }
    ],
    "seoTitle": "Tesla Model S Black в аренду — RPM Rent",
    "seoDescription": "Tesla Model S Black, 2017 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  },
  {
    "id": "car-tesla-model-3-black-2020",
    "slug": "tesla-model-3-black-2020",
    "brand": "Tesla",
    "model": "Model 3 Black",
    "title": "Tesla Model 3 Black",
    "category": "Автомобили",
    "bodyType": "Не указан",
    "vehicleClass": "Не указан",
    "year": 2020,
    "transmission": null,
    "engine": "AWD Performance",
    "horsepower": 500,
    "driveType": null,
    "seats": null,
    "shortDescription": "Tesla Model 3 Black, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "description": "Tesla Model 3 Black, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM.",
    "pricePerDay": 10000,
    "oldPrice": null,
    "deposit": 0,
    "minimumAge": null,
    "minimumDrivingExperience": null,
    "minimumRentalDays": null,
    "mileageLimit": null,
    "extraMileagePrice": null,
    "insurance": null,
    "features": [
      "Поколение: I (2017—2023)",
      "Комплектация: Базовая",
      "Разгон: 0–100 км/ч: 3,3–3,4 секунды"
    ],
    "rentalConditions": [
      "12 часов — 8 ₽",
      "3–7 суток — 9 000 ₽/сутки"
    ],
    "available": false,
    "published": true,
    "isNew": true,
    "isPromotion": false,
    "isDemo": true,
    "recommendedOrder": 135,
    "images": [
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F1%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 1"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F2%20(1).jpg",
        "alt": "Tesla Model 3 Black — фото 2"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F3%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 3"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F4%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 4"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F5%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 5"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F6%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 6"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F7%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 7"
      },
      {
        "url": "/api/media/yandex?path=%2FTesla%2FTesla%20Black%20Model%203%20756%20(2020)%2F%D0%98%D0%98%2F8%20(2).jpg",
        "alt": "Tesla Model 3 Black — фото 8"
      }
    ],
    "seoTitle": "Tesla Model 3 Black в аренду — RPM Rent",
    "seoDescription": "Tesla Model 3 Black, 2020 год. Характеристики и тарифы импортированы из рабочего стандарта RPM."
  }
];

export const normalizeImportedPublicCopy = (value: string) => value
  .replace(/Характеристики и тарифы импортированы из рабочего стандарта RPM\./g, "Технические характеристики и условия аренды для этой модели.")
  .replace(/Импортировано из рабочего стандарта RPM\./g, "Технические характеристики и условия аренды для этой модели.")
  .replace(/Тариф на 12 часов не указан/g, "Тариф на 12 часов уточняется у менеджера")
  .replace(/Тариф на 3–7 суток не указан/g, "Тариф на 3–7 суток уточняется у менеджера")
  .replace("Сompetition", "Competition")
  .replace("Разгон: дo 100 км/ч зaнимaет окoлo", "Разгон: до 100 км/ч занимает около")
  .replace("Sроrt Сhrоnо", "Sport Chrono")
  .replace("ceкунды", "секунды")
  .replace("Поколение: Поколение: I (2013—2026", "Поколение: I (2013—2026");

export const importedCars: Car[] = importedCarRecords.map((car) => ({
  ...car,
  category: vehicleClassForCar(car.slug),
  vehicleClass: vehicleClassForCar(car.slug),
  shortDescription: normalizeImportedPublicCopy(car.shortDescription),
  description: normalizeImportedPublicCopy(car.description),
  seoDescription: car.seoDescription ? normalizeImportedPublicCopy(car.seoDescription) : car.seoDescription,
  features: car.features.map(normalizeImportedPublicCopy),
  rentalConditions: car.rentalConditions.map(normalizeImportedPublicCopy),
}));
