import { readFile, mkdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { BookingStatus, Prisma, PrismaClient } from "../src/generated/prisma/client";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import { normalizeVercelCar, normalizeVercelLocation } from "../src/lib/vercel-admin-import";

type RawRecord = Record<string, unknown>;
type ExportFile = {
  source: string;
  cars: RawRecord[];
  services: RawRecord[];
  faqs: RawRecord[];
  locations: RawRecord[];
  bookings: RawRecord[];
};

const sourcePath = process.argv[2]?.trim();
if (!sourcePath) throw new Error("Usage: tsx scripts/import-vercel-admin.ts /import/vercel-admin-export.json");
const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const source = JSON.parse(await readFile(sourcePath, "utf8")) as ExportFile;
if (!source.source?.startsWith("https://") || !Array.isArray(source.cars)) throw new Error("Invalid Vercel export");
const mediaRoot = resolve(process.env.LOCAL_MEDIA_ROOT || "/app/media");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const text = (value: unknown) => typeof value === "string" ? value : "";
const nullableText = (value: unknown) => {
  const result = text(value).trim();
  return result && result !== "$undefined" ? result : null;
};
const integer = (value: unknown, fallback = 0) => Number.isInteger(Number(value)) ? Number(value) : fallback;
const nullableInteger = (value: unknown) => value === "" || value === null || value === undefined ? null : integer(value);
const checked = (value: unknown) => value === true || value === "on" || value === "true";
const dateOnly = (value: unknown) => {
  const result = new Date(`${text(value).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(result.getTime())) throw new Error("Invalid booking date in export");
  return result;
};
const optionalDateOnly = (value: unknown) => value ? dateOnly(value) : null;

const storageUrls = [...source.cars, ...source.locations].flatMap((record) => {
  const images = Array.isArray(record.images) ? record.images : [record.images];
  return images.filter((value): value is string => typeof value === "string" && value.startsWith("/api/media/storage?"));
});
const uniqueStorageUrls = [...new Set(storageUrls)];

const downloadMedia = async (url: string) => {
  const remote = new URL(url, source.source);
  const path = remote.searchParams.get("path") || "";
  const segments = path.split("/");
  if (!path || path.startsWith("/") || path.includes("\\") || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Unsafe media path: ${path}`);
  }
  const destination = resolve(mediaRoot, ...segments);
  if (!destination.startsWith(`${mediaRoot}${sep}`)) throw new Error(`Unsafe media destination: ${path}`);
  try {
    if ((await stat(destination)).size > 0) return "existing" as const;
  } catch { /* Download missing media. */ }
  const response = await fetch(remote, { redirect: "follow" });
  if (!response.ok) throw new Error(`Media download failed: ${response.status} ${path}`);
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length || body.length > 20 * 1024 * 1024) throw new Error(`Invalid media size: ${path}`);
  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.importing`;
  await writeFile(temporary, body);
  await rename(temporary, destination).catch(async (error) => { await unlink(temporary).catch(() => undefined); throw error; });
  return "downloaded" as const;
};

let downloaded = 0;
let existingMedia = 0;
for (let index = 0; index < uniqueStorageUrls.length; index += 6) {
  const results = await Promise.all(uniqueStorageUrls.slice(index, index + 6).map(downloadMedia));
  downloaded += results.filter((result) => result === "downloaded").length;
  existingMedia += results.filter((result) => result === "existing").length;
}

try {
  for (const raw of source.cars) {
    const current = await prisma.car.findUnique({ where: { id: text(raw.id) } });
    const car = normalizeVercelCar(raw, current);
    const { images, ...data } = car;
    await prisma.$transaction(async (database) => {
      await database.car.upsert({ where: { id: car.id }, create: data, update: data });
      await database.carImage.deleteMany({ where: { carId: car.id } });
      if (images.length) await database.carImage.createMany({ data: images.map((image, sortOrder) => ({ carId: car.id, ...image, sortOrder })) });
    });
  }

  for (const raw of source.services) {
    const service = {
      id: text(raw.id), slug: text(raw.slug), title: text(raw.title), description: text(raw.description),
      price: nullableInteger(raw.price), published: checked(raw.published), sortOrder: integer(raw.sortOrder),
    };
    await prisma.service.upsert({ where: { id: service.id }, create: service, update: service });
  }

  for (const raw of source.faqs) {
    const faq = {
      id: text(raw.id), question: text(raw.question), answer: text(raw.answer), category: text(raw.category),
      published: checked(raw.published), sortOrder: integer(raw.sortOrder),
    };
    await prisma.faq.upsert({ where: { id: faq.id }, create: faq, update: faq });
  }

  for (const raw of source.locations) {
    const current = await prisma.location.findUnique({ where: { id: text(raw.id) } });
    const location = normalizeVercelLocation(raw, current);
    const { images, ...data } = location;
    const locationData = { ...data, image: images[0] ?? "", images };
    await prisma.location.upsert({ where: { id: location.id }, create: locationData, update: locationData });
  }

  let addedBookings = 0;
  for (const raw of source.bookings) {
    const id = text(raw.id);
    const idempotencyKey = text(raw.idempotencyKey);
    const existing = await prisma.booking.findFirst({ where: { OR: [{ id }, { idempotencyKey }] }, select: { id: true } });
    if (existing) continue;
    const data: Prisma.BookingUncheckedCreateInput = {
      id, carId: text(raw.carId), carTitle: text(raw.carTitle), startAt: dateOnly(raw.startAt), endAt: dateOnly(raw.endAt),
      pickupMethod: text(raw.pickupMethod), deliveryAddress: nullableText(raw.deliveryAddress), customerName: text(raw.customerName),
      phone: text(raw.phone), telegram: nullableText(raw.telegram), birthDate: optionalDateOnly(raw.birthDate),
      licenseIssuedOn: optionalDateOnly(raw.licenseIssuedOn), driverAgeAtStart: nullableInteger(raw.driverAgeAtStart),
      drivingExperienceMonths: integer(raw.drivingExperienceMonths), minimumAgeApplied: nullableInteger(raw.minimumAgeApplied),
      minimumExperienceApplied: nullableInteger(raw.minimumDrivingExperienceApplied), minimumRentalDaysApplied: nullableInteger(raw.minimumRentalDaysApplied),
      additionalServiceIds: (Array.isArray(raw.additionalServiceIds) ? raw.additionalServiceIds : []) as Prisma.InputJsonValue,
      additionalServicesSnapshot: (Array.isArray(raw.additionalServicesSnapshot) ? raw.additionalServicesSnapshot : []) as Prisma.InputJsonValue,
      comment: nullableText(raw.comment), rentalDays: integer(raw.rentalDays), pricePerDaySnapshot: integer(raw.pricePerDaySnapshot),
      rentalPrice: integer(raw.rentalPrice), additionalServicesPrice: integer(raw.additionalServicesPrice), deposit: integer(raw.deposit),
      source: text(raw.source), utm: (raw.utm && typeof raw.utm === "object" ? raw.utm : {}) as Prisma.InputJsonValue,
      referrer: nullableText(raw.referrer), idempotencyKey, privacyConsentAt: raw.privacyConsentAt ? new Date(text(raw.privacyConsentAt)) : null,
      integrityProtected: false, status: text(raw.status) as BookingStatus, createdAt: new Date(text(raw.createdAt)), updatedAt: new Date(text(raw.createdAt)),
    };
    await prisma.booking.create({ data });
    addedBookings += 1;
  }

  const importedCarIds = source.cars.map((car) => text(car.id));
  const actual = {
    cars: await prisma.car.count(),
    importedCars: await prisma.car.count({ where: { id: { in: importedCarIds } } }),
    importedImages: await prisma.carImage.count({ where: { carId: { in: importedCarIds } } }),
    services: await prisma.service.count(), faqs: await prisma.faq.count(), locations: await prisma.location.count(), bookings: await prisma.booking.count(),
  };
  const expectedImportedImages = source.cars.reduce((total, car) => total + (Array.isArray(car.images) ? car.images.length : car.images ? 1 : 0), 0);
  if (actual.importedCars !== source.cars.length || actual.importedImages !== expectedImportedImages || actual.bookings < source.bookings.length) {
    throw new Error(`Import verification failed: ${JSON.stringify({ actual, expectedImportedImages })}`);
  }
  console.log(JSON.stringify({ actual, media: { expected: uniqueStorageUrls.length, downloaded, existing: existingMedia }, addedBookings }));
} finally {
  await prisma.$disconnect();
}
