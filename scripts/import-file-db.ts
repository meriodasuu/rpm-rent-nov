import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { BookingStatus, Prisma, PrismaClient } from "../src/generated/prisma/client";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import type { DevDatabase } from "../src/types/domain";
import { vehicleClassForCar } from "../src/lib/vehicle-class";

const sourcePath = process.argv[2]?.trim();
if (!sourcePath) throw new Error("Usage: pnpm import:file-db /path/to/db.json");

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const source = JSON.parse(await readFile(sourcePath, "utf8")) as Partial<DevDatabase>;
const cars = Array.isArray(source.cars) ? source.cars : [];
const services = Array.isArray(source.services) ? source.services : [];
const faqs = Array.isArray(source.faqs) ? source.faqs : [];
const locations = Array.isArray(source.locations) ? source.locations : [];
const bookings = Array.isArray(source.bookings) ? source.bookings : [];

const dateOnly = (value: string) => {
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${value}`);
  return parsed;
};

const optionalDateOnly = (value: string | null) => value ? dateOnly(value) : null;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

try {
  for (const car of cars) {
    const { id, images, ...data } = car;
    const vehicleClass = vehicleClassForCar(car.slug);
    const normalizedData = { ...data, category: vehicleClass, vehicleClass };
    await prisma.$transaction(async (transaction) => {
      await transaction.car.upsert({
        where: { id },
        create: { id, ...normalizedData },
        update: normalizedData
      });
      await transaction.carImage.deleteMany({ where: { carId: id } });
      if (images.length) {
        await transaction.carImage.createMany({
          data: images.map((image, sortOrder) => ({ carId: id, ...image, sortOrder }))
        });
      }
    });
  }

  for (const service of services) {
    await prisma.service.upsert({ where: { id: service.id }, create: service, update: service });
  }

  for (const faq of faqs) {
    await prisma.faq.upsert({ where: { id: faq.id }, create: faq, update: faq });
  }

  for (const location of locations) {
    const { id, images, ...data } = location;
    const locationData = { ...data, image: images[0] ?? "", images };
    await prisma.location.upsert({
      where: { id },
      create: { id, ...locationData },
      update: locationData
    });
  }

  for (const booking of bookings) {
    const data: Prisma.BookingUncheckedCreateInput = {
      id: booking.id,
      carId: booking.carId,
      carTitle: booking.carTitle,
      startAt: dateOnly(booking.startAt),
      endAt: dateOnly(booking.endAt),
      pickupMethod: booking.pickupMethod,
      deliveryAddress: booking.deliveryAddress,
      customerName: booking.customerName,
      phone: booking.phone,
      telegram: booking.telegram,
      birthDate: optionalDateOnly(booking.birthDate),
      licenseIssuedOn: optionalDateOnly(booking.licenseIssuedOn),
      driverAgeAtStart: booking.driverAgeAtStart,
      drivingExperienceMonths: booking.drivingExperienceMonths,
      minimumAgeApplied: booking.minimumAgeApplied,
      minimumExperienceApplied: booking.minimumDrivingExperienceApplied,
      minimumRentalDaysApplied: booking.minimumRentalDaysApplied,
      additionalServiceIds: booking.additionalServiceIds,
      additionalServicesSnapshot: booking.additionalServicesSnapshot,
      comment: booking.comment,
      rentalDays: booking.rentalDays,
      pricePerDaySnapshot: booking.pricePerDaySnapshot,
      rentalPrice: booking.rentalPrice,
      additionalServicesPrice: booking.additionalServicesPrice,
      deposit: booking.deposit,
      source: booking.source,
      utm: booking.utm,
      referrer: booking.referrer,
      idempotencyKey: booking.idempotencyKey,
      privacyConsentAt: booking.privacyConsentAt ? new Date(booking.privacyConsentAt) : null,
      // Legacy JSON data may contain overlaps that predate the PostgreSQL
      // exclusion constraint. Application-level availability checks still
      // include these rows, while future bookings use protected writes.
      integrityProtected: false,
      status: booking.status as BookingStatus,
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.createdAt)
    };
    await prisma.booking.upsert({ where: { id: booking.id }, create: data, update: data });
  }

  const actual = {
    cars: await prisma.car.count(),
    publishedCars: await prisma.car.count({ where: { published: true } }),
    carImages: await prisma.carImage.count(),
    services: await prisma.service.count(),
    faqs: await prisma.faq.count(),
    locations: await prisma.location.count(),
    bookings: await prisma.booking.count()
  };
  const expected = {
    cars: cars.length,
    publishedCars: cars.filter((car) => car.published).length,
    carImages: cars.reduce((count, car) => count + car.images.length, 0),
    services: services.length,
    faqs: faqs.length,
    locations: locations.length,
    bookings: bookings.length
  };

  const exactKeys = ["cars", "publishedCars", "carImages", "services", "faqs", "locations", "bookings"] as const;
  const mismatches = exactKeys.filter((key) => actual[key] !== expected[key]);
  if (mismatches.length) {
    throw new Error(`Import verification failed: ${JSON.stringify({ expected, actual })}`);
  }

  console.log(JSON.stringify({ expected, actual }, null, 2));
} finally {
  await prisma.$disconnect();
}
