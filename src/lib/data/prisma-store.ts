import { getPaidTrafficSource } from "@/lib/direct-traffic";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeImportedPublicCopy } from "@/data/imported-cars";
import { PrismaClient } from "@/generated/prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { blockingBookingStatuses } from "@/lib/availability";
import { assertBookingStatusTransition } from "@/lib/domain/booking-status";
import { parseLeadStatus } from "@/lib/domain/lead-status";
import { prepareBooking } from "@/lib/domain/booking";
import { assertRentalPeriod, normalizeStoredDate, parseDateOnly } from "@/lib/domain/dates";
import { DomainError } from "@/lib/domain/errors";
import type { BookingInput, DirectLeadInput } from "@/lib/validation";
import type { Booking, BookingServiceSnapshot, BookingStatus, Car, Faq, Lead, LeadCreateResult, Location, OriginDomain, Service, TelegramOperator } from "@/types/domain";
import type { DataStore } from "./store";

declare global {
  var rpmPrisma: PrismaClient | undefined;
}

export const getPrisma = () => {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) throw new Error("DATABASE_URL is required for the PostgreSQL data store");
  if (!globalThis.rpmPrisma) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    globalThis.rpmPrisma = new PrismaClient({ adapter });
  }
  return globalThis.rpmPrisma;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};

const asServiceSnapshots = (value: unknown): BookingServiceSnapshot[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return typeof record.id === "string" && typeof record.title === "string" && typeof record.price === "number"
      ? [{ id: record.id, title: record.title, price: record.price }]
      : [];
  });
};

const toDatabaseDate = (value: string) => {
  const date = parseDateOnly(value);
  if (!date) throw new DomainError("VALIDATION_ERROR", "Некорректная календарная дата", 422);
  return date;
};

const errorText = (error: unknown) => error instanceof Error ? `${error.name}: ${error.message}` : String(error);
const isExclusionConflict = (error: unknown) => /23P01|Booking_no_overlapping_active_periods/i.test(errorText(error));
const isIdempotencyConflict = (error: unknown) => /P2002|idempotencyKey/i.test(errorText(error));

type PrismaCarRecord = Awaited<ReturnType<ReturnType<typeof getPrisma>["car"]["findFirst"]>> & {
  images?: Array<{ url: string; alt: string; sortOrder: number }>;
};

const mapCar = (record: NonNullable<PrismaCarRecord>): Car => ({
  id: record.id,
  slug: record.slug,
  brand: record.brand,
  model: record.model,
  title: record.title,
  category: record.category,
  bodyType: record.bodyType,
  vehicleClass: record.vehicleClass,
  year: record.year,
  transmission: record.transmission,
  engine: record.engine,
  horsepower: record.horsepower,
  driveType: record.driveType,
  seats: record.seats,
  shortDescription: normalizeImportedPublicCopy(record.shortDescription),
  description: normalizeImportedPublicCopy(record.description),
  pricePerDay: record.pricePerDay,
  oldPrice: record.oldPrice,
  deposit: record.deposit,
  minimumAge: record.minimumAge,
  minimumDrivingExperience: record.minimumDrivingExperience,
  minimumRentalDays: record.minimumRentalDays,
  mileageLimit: record.mileageLimit,
  extraMileagePrice: record.extraMileagePrice,
  insurance: record.insurance,
  features: asStringArray(record.features).map(normalizeImportedPublicCopy),
  rentalConditions: asStringArray(record.rentalConditions).map(normalizeImportedPublicCopy),
  available: record.available,
  published: record.published,
  isNew: record.isNew,
  isPromotion: record.isPromotion,
  isDemo: record.isDemo,
  recommendedOrder: record.recommendedOrder,
  images: (record.images ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map(({ url, alt }) => ({ url, alt })),
  seoTitle: record.seoTitle,
  seoDescription: record.seoDescription ? normalizeImportedPublicCopy(record.seoDescription) : record.seoDescription
});

const mapLocation = (record: {
  id: string; slug: string; title: string; subtitle: string; description: string; image: string;
  address: string | null; mapUrl: string | null; directions: string | null; workingHours: string | null;
  images: unknown;
  published: boolean; sortOrder: number; seoTitle: string | null; seoDescription: string | null;
}): Location => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  subtitle: record.subtitle,
  description: record.description,
  address: record.address,
  mapUrl: record.mapUrl,
  directions: record.directions,
  workingHours: record.workingHours,
  images: asStringArray(record.images).length ? asStringArray(record.images) : [record.image].filter(Boolean),
  published: record.published,
  sortOrder: record.sortOrder,
  seoTitle: record.seoTitle,
  seoDescription: record.seoDescription
});

export class PrismaStore implements DataStore {
  async getCars(options?: { includeHidden?: boolean }) {
    const rows = await getPrisma().car.findMany({
      where: options?.includeHidden ? undefined : { published: true },
      include: { images: true },
      orderBy: { recommendedOrder: "asc" }
    });
    return rows.map(mapCar);
  }

  async getCarBySlug(slug: string, options?: { includeHidden?: boolean }) {
    const row = await getPrisma().car.findFirst({
      where: { slug, ...(options?.includeHidden ? {} : { published: true }) },
      include: { images: true }
    });
    return row ? mapCar(row) : null;
  }

  async getCarById(id: string) {
    const row = await getPrisma().car.findUnique({ where: { id }, include: { images: true } });
    return row ? mapCar(row) : null;
  }

  async saveCar(car: Car) {
    const duplicate = await getPrisma().car.findFirst({ where: { slug: car.slug, NOT: { id: car.id } }, select: { id: true } });
    if (duplicate) throw new DomainError("DUPLICATE_SLUG", "Автомобиль с таким slug уже существует", 409);
    const data = {
      slug: car.slug,
      brand: car.brand,
      model: car.model,
      title: car.title,
      category: car.category,
      bodyType: car.bodyType,
      vehicleClass: car.vehicleClass,
      year: car.year,
      transmission: car.transmission,
      engine: car.engine,
      horsepower: car.horsepower,
      driveType: car.driveType,
      seats: car.seats,
      shortDescription: car.shortDescription,
      description: car.description,
      pricePerDay: car.pricePerDay,
      oldPrice: car.oldPrice,
      deposit: car.deposit,
      minimumAge: car.minimumAge,
      minimumDrivingExperience: car.minimumDrivingExperience,
      minimumRentalDays: car.minimumRentalDays,
      mileageLimit: car.mileageLimit,
      extraMileagePrice: car.extraMileagePrice,
      insurance: car.insurance,
      features: car.features,
      rentalConditions: car.rentalConditions,
      available: car.available,
      published: car.published,
      isNew: car.isNew,
      isPromotion: car.isPromotion,
      isDemo: car.isDemo,
      recommendedOrder: car.recommendedOrder,
      seoTitle: car.seoTitle,
      seoDescription: car.seoDescription
    };
    const row = await getPrisma().$transaction(async (database) => {
      const saved = await database.car.upsert({ where: { id: car.id }, create: { id: car.id, ...data }, update: data });
      await database.carImage.deleteMany({ where: { carId: saved.id } });
      if (car.images.length) {
        await database.carImage.createMany({ data: car.images.map((image, sortOrder) => ({ carId: saved.id, url: image.url, alt: image.alt, sortOrder })) });
      }
      return database.car.findUniqueOrThrow({ where: { id: saved.id }, include: { images: true } });
    });
    return mapCar(row);
  }

  async deleteCar(id: string) {
    if (await getPrisma().booking.findFirst({ where: { carId: id }, select: { id: true } })) {
      throw new DomainError("VALIDATION_ERROR", "Нельзя удалить автомобиль с заявками: снимите его с публикации", 409);
    }
    await getPrisma().car.delete({ where: { id } });
  }

  async getServices(options?: { includeHidden?: boolean }) {
    const rows = await getPrisma().service.findMany({ where: options?.includeHidden ? undefined : { published: true }, orderBy: { sortOrder: "asc" } });
    return rows satisfies Service[];
  }

  async saveService(service: Service) {
    const duplicate = await getPrisma().service.findFirst({ where: { slug: service.slug, NOT: { id: service.id } }, select: { id: true } });
    if (duplicate) throw new DomainError("DUPLICATE_SLUG", "Услуга с таким slug уже существует", 409);
    return getPrisma().service.upsert({ where: { id: service.id }, create: service, update: service });
  }

  async deleteService(id: string) {
    const used = await getPrisma().booking.findFirst({ where: { additionalServiceIds: { array_contains: [id] } }, select: { id: true } });
    if (used) throw new DomainError("VALIDATION_ERROR", "Нельзя удалить услугу, использованную в заявках: снимите её с публикации", 409);
    await getPrisma().service.delete({ where: { id } });
  }

  async getFaqs(options?: { includeHidden?: boolean }) {
    const rows = await getPrisma().faq.findMany({ where: options?.includeHidden ? undefined : { published: true }, orderBy: { sortOrder: "asc" } });
    return rows satisfies Faq[];
  }

  async saveFaq(faq: Faq) { return getPrisma().faq.upsert({ where: { id: faq.id }, create: faq, update: faq }); }
  async deleteFaq(id: string) { await getPrisma().faq.delete({ where: { id } }); }

  async getLocations(options?: { includeHidden?: boolean }) {
    const rows = await getPrisma().location.findMany({
      where: options?.includeHidden ? undefined : { published: true },
      orderBy: { sortOrder: "asc" }
    });
    return rows.map(mapLocation);
  }

  async getLocationBySlug(slug: string, options?: { includeHidden?: boolean }) {
    const row = await getPrisma().location.findFirst({
      where: { slug, ...(options?.includeHidden ? {} : { published: true }) }
    });
    return row ? mapLocation(row) : null;
  }

  async saveLocation(location: Location) {
    const duplicate = await getPrisma().location.findFirst({ where: { slug: location.slug, NOT: { id: location.id } }, select: { id: true } });
    if (duplicate) throw new DomainError("DUPLICATE_SLUG", "Локация с таким slug уже существует", 409);
    const { id, images, ...rest } = location;
    const data = { ...rest, image: images[0] ?? "", images };
    return mapLocation(await getPrisma().location.upsert({ where: { id }, create: { id, ...data }, update: data }));
  }

  async deleteLocation(id: string) { await getPrisma().location.delete({ where: { id } }); }

  async createBooking(input: BookingInput, originDomain: OriginDomain | null = null): Promise<Booking> {
    try {
      const result = await getPrisma().$transaction(async (database) => {
        const existing = await database.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (existing) return existing;
        const selectedCar = await database.car.findUnique({ where: { id: input.carId } });
        if (!selectedCar) throw new DomainError("NOT_FOUND", "Автомобиль не найден", 404);
        const services = await database.service.findMany({ where: { id: { in: input.additionalServiceIds } } });
        const prepared = prepareBooking(input, selectedCar, services);
        const startAt = toDatabaseDate(input.startAt);
        const endAt = toDatabaseDate(input.endAt);
        const conflict = await database.booking.findFirst({
          where: { carId: input.carId, status: { in: blockingBookingStatuses }, startAt: { lt: endAt }, endAt: { gt: startAt } },
          select: { id: true }
        });
        if (conflict) throw new DomainError("BOOKING_CONFLICT", "Автомобиль уже занят на выбранный период. Выберите другие даты.", 409);
        return database.booking.create({
          data: {
            carId: selectedCar.id,
            carTitle: selectedCar.title,
            startAt,
            endAt,
            pickupMethod: input.pickupMethod,
            deliveryAddress: input.deliveryAddress || null,
            customerName: input.customerName,
            phone: input.phone,
            telegram: input.telegram || null,
            birthDate: null,
            licenseIssuedOn: null,
            driverAgeAtStart: null,
            drivingExperienceMonths: null,
            minimumAgeApplied: prepared.driverRequirements.minimumAge,
            minimumExperienceApplied: prepared.driverRequirements.minimumExperienceMonths,
            minimumRentalDaysApplied: selectedCar.minimumRentalDays,
            additionalServiceIds: prepared.serviceSnapshots.map((service) => service.id),
            additionalServicesSnapshot: prepared.serviceSnapshots,
            comment: input.comment || null,
            rentalDays: prepared.rentalDays,
            pricePerDaySnapshot: selectedCar.pricePerDay,
            rentalPrice: prepared.calculation.rentalPrice,
            additionalServicesPrice: prepared.calculation.servicesPrice,
            deposit: prepared.calculation.deposit,
            source: "website_booking",
            originDomain,
            utm: input.utm,
            referrer: input.referrer || null,
            idempotencyKey: input.idempotencyKey,
            privacyConsentAt: new Date(prepared.privacyConsentAt)
          }
        });
      }, { isolationLevel: "Serializable" });
      return this.mapBooking(result);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      if (isIdempotencyConflict(error)) {
        const existing = await getPrisma().booking.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (existing) return this.mapBooking(existing);
      }
      if (isExclusionConflict(error)) {
        throw new DomainError("BOOKING_CONFLICT", "Автомобиль уже занят на выбранный период. Выберите другие даты.", 409);
      }
      throw error;
    }
  }

  async createLead(input: DirectLeadInput, originDomain: OriginDomain | null = null): Promise<LeadCreateResult> {
    try {
      const result = await getPrisma().$transaction(async (database) => {
        const existing = await database.lead.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (existing) return { record: existing, created: false };
        const car = await database.car.findFirst({ where: { id: input.carId, published: true } });
        if (!car) throw new DomainError("NOT_FOUND", "Автомобиль недоступен для заявки", 404);
        const record = await database.lead.create({ data: {
          carId: car.id, carTitle: car.title, startAt: toDatabaseDate(input.startAt), phone: input.phone,
          source: getPaidTrafficSource(new URLSearchParams(input.utm)) ?? "yandex_direct", originDomain, utm: input.utm, landingPath: input.landingPath, referrer: input.referrer || null,
          idempotencyKey: input.idempotencyKey, privacyConsentAt: new Date(), status: "NEW"
        } });
        return { record, created: true };
      }, { isolationLevel: "Serializable" });
      return { lead: this.mapLead(result.record), created: result.created };
    } catch (error) {
      if (error instanceof DomainError) throw error;
      if (isIdempotencyConflict(error)) {
        const existing = await getPrisma().lead.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (existing) return { lead: this.mapLead(existing), created: false };
      }
      throw error;
    }
  }

  async isCarAvailable(carId: string, startDate: string, endDate: string) {
    const car = await getPrisma().car.findFirst({ where: { id: carId, published: true, available: true } });
    if (!car) return false;
    try {
      assertRentalPeriod({ startDate, endDate, minimumRentalDays: car.minimumRentalDays ?? 1 });
    } catch {
      return false;
    }
    const startAt = toDatabaseDate(startDate);
    const endAt = toDatabaseDate(endDate);
    const conflict = await getPrisma().booking.findFirst({
      where: { carId, status: { in: blockingBookingStatuses }, startAt: { lt: endAt }, endAt: { gt: startAt } },
      select: { id: true }
    });
    return !conflict;
  }

  private mapBooking(record: Awaited<ReturnType<ReturnType<typeof getPrisma>["booking"]["findFirst"]>>): Booking {
    if (!record) throw new DomainError("NOT_FOUND", "Заявка не найдена", 404);
    return {
      id: record.id,
      bookingNumber: record.bookingNumber,
      carId: record.carId,
      carTitle: record.carTitle,
      startAt: normalizeStoredDate(record.startAt),
      endAt: normalizeStoredDate(record.endAt),
      pickupMethod: record.pickupMethod === "delivery" ? "delivery" : "office",
      deliveryAddress: record.deliveryAddress,
      customerName: record.customerName,
      phone: record.phone,
      telegram: record.telegram,
      birthDate: record.birthDate ? normalizeStoredDate(record.birthDate) : null,
      licenseIssuedOn: record.licenseIssuedOn ? normalizeStoredDate(record.licenseIssuedOn) : null,
      driverAgeAtStart: record.driverAgeAtStart,
      drivingExperienceMonths: record.drivingExperienceMonths,
      minimumAgeApplied: record.minimumAgeApplied,
      minimumDrivingExperienceApplied: record.minimumExperienceApplied,
      minimumRentalDaysApplied: record.minimumRentalDaysApplied,
      additionalServiceIds: asStringArray(record.additionalServiceIds),
      additionalServicesSnapshot: asServiceSnapshots(record.additionalServicesSnapshot),
      comment: record.comment,
      managerComment: record.managerComment,
      rentalDays: record.rentalDays,
      pricePerDaySnapshot: record.pricePerDaySnapshot,
      rentalPrice: record.rentalPrice,
      additionalServicesPrice: record.additionalServicesPrice,
      deposit: record.deposit,
      source: record.source,
      originDomain: record.originDomain as OriginDomain | null,
      utm: asStringRecord(record.utm),
      referrer: record.referrer,
      idempotencyKey: record.idempotencyKey,
      privacyConsentAt: record.privacyConsentAt?.toISOString() ?? null,
      status: record.status,
      createdAt: record.createdAt.toISOString()
    };
  }

  async getBookings() {
    const rows = await getPrisma().booking.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => this.mapBooking(row));
  }

  async getLeads() {
    const rows = await getPrisma().lead.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => this.mapLead(row));
  }

  private mapLead(record: { source?: string; id: string; carId: string; carTitle: string; startAt: Date; phone: string; managerComment: string | null; originDomain: string | null; utm: unknown; landingPath: string; referrer: string | null; idempotencyKey: string; privacyConsentAt: Date; createdAt: Date; status: string }): Lead {
    return {
      id: record.id, carId: record.carId, carTitle: record.carTitle, startAt: normalizeStoredDate(record.startAt), phone: record.phone,
      managerComment: record.managerComment,
      source: record.source === "vk_ads" ? "vk_ads" : "yandex_direct", originDomain: record.originDomain as OriginDomain | null, utm: asStringRecord(record.utm), landingPath: record.landingPath, referrer: record.referrer,
      idempotencyKey: record.idempotencyKey, privacyConsentAt: record.privacyConsentAt.toISOString(), status: parseLeadStatus(record.status), createdAt: record.createdAt.toISOString()
    };
  }

  async updateLeadStatus(id: string, status: import("@/types/domain").LeadStatus) {
    const result = await getPrisma().lead.updateMany({ where: { id }, data: { status: parseLeadStatus(status) } });
    if (!result.count) throw new DomainError("NOT_FOUND", "Лид не найден", 404);
  }

  async updateInquiryComment(kind: "booking" | "lead", id: string, comment: string | null) {
    const args = { where: { id }, data: { managerComment: comment } };
    const result = kind === "booking"
      ? await getPrisma().booking.updateMany(args)
      : await getPrisma().lead.updateMany(args);
    if (!result.count) throw new DomainError("NOT_FOUND", "Обращение не найдено", 404);
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    await getPrisma().$transaction(async (database) => {
      const booking = await database.booking.findUnique({ where: { id }, select: { status: true } });
      if (!booking) throw new DomainError("NOT_FOUND", "Заявка не найдена", 404);
      assertBookingStatusTransition(booking.status, status);
      await database.booking.update({ where: { id }, data: { status } });
    }, { isolationLevel: "Serializable" });
  }

  async getTelegramOperators() {
    const operators = await getPrisma().telegramOperator.findMany({ orderBy: { createdAt: "asc" } });
    return operators.map((operator) => this.mapTelegramOperator(operator));
  }

  async getTelegramOperatorByUserId(telegramUserId: string) {
    const operator = await getPrisma().telegramOperator.findUnique({ where: { telegramUserId } });
    return operator ? this.mapTelegramOperator(operator) : null;
  }

  async activateTelegramOperator(input: { telegramUserId: string; username: string; bootstrapAdminUsernames: string[] }) {
    const username = input.username.toLowerCase();
    return getPrisma().$transaction(async (database) => {
      const existingById = await database.telegramOperator.findUnique({ where: { telegramUserId: input.telegramUserId } });
      if (existingById) return this.mapTelegramOperator(existingById);
      const existingByUsername = await database.telegramOperator.findUnique({ where: { username } });
      if (existingByUsername) {
        if (existingByUsername.telegramUserId) return null;
        return this.mapTelegramOperator(await database.telegramOperator.update({ where: { id: existingByUsername.id }, data: { telegramUserId: input.telegramUserId } }));
      }
      if (!input.bootstrapAdminUsernames.map((item) => item.toLowerCase()).includes(username)) return null;
      return this.mapTelegramOperator(await database.telegramOperator.create({ data: { username, telegramUserId: input.telegramUserId, role: "ADMIN" } }));
    }, { isolationLevel: "Serializable" });
  }

  async inviteTelegramOperator(input: { username: string }) {
    const username = input.username.toLowerCase();
    const operator = await getPrisma().telegramOperator.upsert({ where: { username }, create: { username, role: "OPERATOR" }, update: {} });
    return this.mapTelegramOperator(operator);
  }

  private mapTelegramOperator(record: { id: string; telegramUserId: string | null; username: string; role: "ADMIN" | "OPERATOR"; createdAt: Date }): TelegramOperator {
    return { id: record.id, telegramUserId: record.telegramUserId, username: record.username, role: record.role, createdAt: record.createdAt.toISOString() };
  }
}
