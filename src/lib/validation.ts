import { getPaidTrafficSource } from "@/lib/direct-traffic";
import { z } from "zod";
import { RENTAL_POLICY } from "@/config/rental-policy";
import { DATE_ONLY_PATTERN, differenceInCalendarDays, parseDateOnly, todayInBusinessTimeZone } from "@/lib/domain/dates";
import { VEHICLE_CLASSES } from "@/lib/vehicle-class";

const safeText = (minimum: number, maximum: number, requiredMessage: string) =>
  z.string().trim().min(minimum, requiredMessage).max(maximum).refine((value) => !/[<>\u0000-\u001F]/.test(value), "Недопустимые символы");

const safeMultilineText = (minimum: number, maximum: number, requiredMessage: string) =>
  z.string().trim().min(minimum, requiredMessage).max(maximum).refine((value) => !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value), "Недопустимые символы");

const dateOnly = z.string().regex(DATE_ONLY_PATTERN, "Используйте дату в формате ГГГГ-ММ-ДД").refine((value) => Boolean(parseDateOnly(value)), "Некорректная дата");

const phone = z
  .string()
  .trim()
  .min(7, "Введите номер телефона")
  .max(30, "Номер слишком длинный")
  .regex(/^\+?[0-9()\-\s]+$/, "Телефон содержит недопустимые символы")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Введите от 7 до 15 цифр");

const httpUrl = z.url().max(500).refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "Разрешены только HTTP(S) адреса");

export const bookingSchema = z
  .object({
    carId: z.string().trim().min(1).max(100),
    startAt: dateOnly,
    endAt: dateOnly,
    pickupMethod: z.enum(["office", "delivery"]),
    deliveryAddress: z.string().trim().max(300).refine((value) => !/[<>\u0000-\u001F]/.test(value), "Недопустимые символы").optional().default(""),
    customerName: safeText(2, 100, "Укажите имя"),
    phone,
    telegram: z.string().trim().max(33).regex(/^$|^@?[A-Za-z0-9_]{5,32}$/, "Укажите username Telegram").optional().default(""),
    additionalServiceIds: z.array(z.string().trim().min(1).max(100)).max(RENTAL_POLICY.maximumSelectedServices).default([]),
    comment: z.string().trim().max(1000).refine((value) => !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value), "Недопустимые символы").optional().default(""),
    privacyConsent: z.literal(true, { error: "Подтвердите согласие на обработку данных" }),
    utm: z.record(z.string().regex(/^(utm_[A-Za-z0-9_]{1,50}|yclid|rb_clickid)$/), z.string().trim().max(200).refine((value) => !/[<>\u0000-\u001F]/.test(value), "Недопустимые символы")).default({}),
    referrer: z.union([z.literal(""), httpUrl]).optional().default(""),
    idempotencyKey: z.uuid()
  })
  .strict()
  .superRefine((value, context) => {
    if (differenceInCalendarDays(value.startAt, value.endAt) <= 0) {
      context.addIssue({ code: "custom", path: ["endAt"], message: "Окончание должно быть позже начала" });
    }
    if (value.pickupMethod === "delivery" && value.deliveryAddress.length < 5) {
      context.addIssue({ code: "custom", path: ["deliveryAddress"], message: "Укажите адрес доставки" });
    }
    if (new Set(value.additionalServiceIds).size !== value.additionalServiceIds.length) {
      context.addIssue({ code: "custom", path: ["additionalServiceIds"], message: "Услуга не должна повторяться" });
    }
    if (Object.keys(value.utm).length > 20) {
      context.addIssue({ code: "custom", path: ["utm"], message: "Слишком много UTM-параметров" });
    }
  });

export type BookingInput = z.infer<typeof bookingSchema>;

export const directLeadSchema = z.object({
  carId: z.string().trim().min(1).max(100),
  startAt: dateOnly,
  phone,
  privacyConsent: z.literal(true, { error: "Подтвердите согласие на обработку данных" }),
  utm: z.record(z.string().regex(/^(utm_[A-Za-z0-9_]{1,50}|yclid|rb_clickid)$/), z.string().trim().max(200).refine((value) => !/[<>\u0000-\u001F]/.test(value), "Недопустимые символы")).default({}),
  landingPath: z.string().trim().min(1).max(500).startsWith("/", "Укажите путь посадочной страницы"),
  referrer: z.union([z.literal(""), httpUrl]).optional().default(""),
  idempotencyKey: z.uuid()
}).strict().superRefine((value, context) => {
  if (Object.keys(value.utm).length > 20) {
    context.addIssue({ code: "custom", path: ["utm"], message: "Слишком много UTM-параметров" });
  }
  if (!getPaidTrafficSource(new URLSearchParams(value.utm))) {
    context.addIssue({ code: "custom", path: ["utm"], message: "Лид доступен только для трафика Яндекс.Директа или VK Рекламы" });
  }
  if (value.startAt < todayInBusinessTimeZone()) {
    context.addIssue({ code: "custom", path: ["startAt"], message: "Дата начала не может быть в прошлом" });
  }
});

export type DirectLeadInput = z.infer<typeof directLeadSchema>;

const optionalInteger = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => value === "" || value === null || value === undefined ? null : Number(value),
    z.number().int().min(minimum).max(maximum).nullable()
  );

const optionalText = (maximum: number) => z.preprocess(
  (value) => String(value ?? "").trim() || null,
  z.string().max(maximum).refine((value) => !/[<>\u0000-\u001F]/.test(value), "Недопустимые символы").nullable()
);

const optionalHttpsUrl = z.preprocess(
  (value) => String(value ?? "").trim() || null,
  z.url().max(1000).refine((value) => {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (host === "yandex.ru" || host.endsWith(".yandex.ru") || host === "2gis.ru" || host.endsWith(".2gis.ru"));
  }, "Укажите ссылку https на Яндекс Карты или 2ГИС").nullable()
);

export const carAdminSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латиницу, цифры и одиночные дефисы"),
    brand: safeText(1, 100, "Укажите марку"),
    model: safeText(1, 100, "Укажите модель"),
    title: safeText(2, 160, "Укажите название"),
    bodyType: safeText(1, 100, "Укажите кузов"),
    vehicleClass: z.enum(VEHICLE_CLASSES, { error: "Выберите класс автомобиля" }),
    pricePerDay: z.coerce.number().int().min(0).max(RENTAL_POLICY.maximumDailyPrice),
    deposit: z.coerce.number().int().min(0).max(RENTAL_POLICY.maximumMoneyAmount),
    shortDescription: safeText(10, 500, "Заполните краткое описание"),
    description: safeMultilineText(20, 10_000, "Заполните описание"),
    available: z.boolean(),
    published: z.boolean(),
    isNew: z.boolean(),
    isPromotion: z.boolean(),
    isDemo: z.boolean(),
    year: optionalInteger(1900, 2200),
    horsepower: optionalInteger(1, 10_000),
    seats: optionalInteger(1, 100),
    oldPrice: optionalInteger(0, RENTAL_POLICY.maximumMoneyAmount),
    minimumAge: optionalInteger(RENTAL_POLICY.legalAdultAge, RENTAL_POLICY.maximumDriverAge),
    minimumDrivingExperience: optionalInteger(0, 1200),
    minimumRentalDays: optionalInteger(1, RENTAL_POLICY.maximumRentalDays),
    mileageLimit: optionalInteger(0, 100_000),
    extraMileagePrice: optionalInteger(0, RENTAL_POLICY.maximumMoneyAmount),
    recommendedOrder: z.coerce.number().int().min(0).max(100_000),
    transmission: optionalText(100),
    engine: optionalText(100),
    driveType: optionalText(100),
    insurance: optionalText(500),
    seoTitle: optionalText(200),
    seoDescription: optionalText(500)
  })
  .strict()
  .superRefine((value, context) => {
    if (value.published && value.available) {
      for (const [field, message] of [
        ["minimumAge", "Перед приёмом заявок задайте минимальный возраст"],
        ["minimumDrivingExperience", "Перед приёмом заявок задайте минимальный стаж"],
        ["minimumRentalDays", "Перед приёмом заявок задайте минимальный срок аренды"]
      ] as const) {
        if (value[field] === null) context.addIssue({ code: "custom", path: [field], message });
      }
    }
  });

export const serviceAdminSchema = z.object({
  id: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: safeText(2, 160, "Укажите название услуги"),
  description: safeText(5, 2000, "Заполните описание услуги"),
  price: optionalInteger(0, RENTAL_POLICY.maximumServicePrice),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100_000)
}).strict();

export const faqAdminSchema = z.object({
  id: z.string().trim().min(1).max(100),
  question: safeText(5, 500, "Заполните вопрос"),
  answer: safeText(5, 5000, "Заполните ответ"),
  category: safeText(1, 100, "Укажите категорию"),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100_000)
}).strict();

export const locationAdminSchema = z.object({
  address: optionalText(300),
  mapUrl: optionalHttpsUrl,
  directions: optionalText(5000),
  workingHours: optionalText(300),
  id: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латиницу, цифры и одиночные дефисы"),
  title: safeText(2, 160, "Укажите название локации"),
  subtitle: safeText(2, 160, "Добавьте короткое описание"),
  description: safeText(20, 10_000, "Добавьте описание локации"),
  images: z.array(z.string().trim().max(500).refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), "Некорректное изображение")).max(50),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100_000),
  seoTitle: optionalText(200),
  seoDescription: optionalText(500)
}).strict().superRefine((value, context) => {
  if (value.published && value.images.length === 0) context.addIssue({ code: "custom", path: ["images"], message: "Добавьте изображение перед публикацией" });
});
