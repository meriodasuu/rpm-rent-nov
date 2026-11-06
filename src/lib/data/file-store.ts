import { getPaidTrafficSource } from "@/lib/direct-traffic";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createSeedDatabase } from "@/data/seed";
import { normalizeImportedPublicCopy } from "@/data/imported-cars";
import { hasBookingConflict } from "@/lib/availability";
import { assertBookingStatusTransition } from "@/lib/domain/booking-status";
import { parseLeadStatus } from "@/lib/domain/lead-status";
import { prepareBooking } from "@/lib/domain/booking";
import { assertRentalPeriod, normalizeStoredDate } from "@/lib/domain/dates";
import { DomainError } from "@/lib/domain/errors";
import type { BookingInput, DirectLeadInput } from "@/lib/validation";
import type { Booking, BookingStatus, Car, DevDatabase, Faq, Lead, LeadCreateResult, Location, OriginDomain, Service, TelegramOperator } from "@/types/domain";
import type { DataStore } from "./store";

const configuredDbPath = process.env.FILE_DATABASE_PATH?.trim();
const defaultDbPath = configuredDbPath ? path.resolve(configuredDbPath) : path.join(process.cwd(), ".data", "db.json");

const normalizeCar = (car: Car): Car => {
  const normalized = {
    ...car,
    minimumRentalDays: car.minimumRentalDays ?? null,
    shortDescription: normalizeImportedPublicCopy(car.shortDescription),
    description: normalizeImportedPublicCopy(car.description),
    seoDescription: car.seoDescription ? normalizeImportedPublicCopy(car.seoDescription) : car.seoDescription,
    features: car.features.map(normalizeImportedPublicCopy),
    rentalConditions: car.rentalConditions.map(normalizeImportedPublicCopy),
  };
  const policyComplete = normalized.minimumAge !== null && normalized.minimumDrivingExperience !== null && normalized.minimumRentalDays !== null;
  return { ...normalized, available: normalized.available && (!normalized.published || policyComplete) };
};

const normalizeBooking = (booking: Booking): Booking => ({
  ...booking,
  originDomain: booking.originDomain ?? null,
  startAt: normalizeStoredDate(booking.startAt),
  endAt: normalizeStoredDate(booking.endAt),
  birthDate: booking.birthDate ? normalizeStoredDate(booking.birthDate) : null,
  licenseIssuedOn: booking.licenseIssuedOn ? normalizeStoredDate(booking.licenseIssuedOn) : null,
  driverAgeAtStart: booking.driverAgeAtStart ?? null,
  minimumAgeApplied: booking.minimumAgeApplied ?? null,
  minimumDrivingExperienceApplied: booking.minimumDrivingExperienceApplied ?? null,
  minimumRentalDaysApplied: booking.minimumRentalDaysApplied ?? null,
  additionalServicesSnapshot: booking.additionalServicesSnapshot ?? [],
  pricePerDaySnapshot: booking.pricePerDaySnapshot ?? (booking.rentalDays > 0 ? Math.trunc(booking.rentalPrice / booking.rentalDays) : 0),
  privacyConsentAt: booking.privacyConsentAt ?? null
});

const normalizeBookings = (bookings: Booking[]): Booking[] => {
  const assigned = new Map<string, number>();
  const occupied = new Set<number>();
  for (const booking of bookings) {
    if (Number.isSafeInteger(booking.bookingNumber) && booking.bookingNumber > 0 && !occupied.has(booking.bookingNumber)) {
      assigned.set(booking.id, booking.bookingNumber);
      occupied.add(booking.bookingNumber);
    }
  }
  let next = 1;
  for (const booking of [...bookings].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))) {
    if (assigned.has(booking.id)) continue;
    while (occupied.has(next)) next += 1;
    assigned.set(booking.id, next);
    occupied.add(next);
  }
  return bookings.map((booking) => normalizeBooking({ ...booking, bookingNumber: assigned.get(booking.id)! }));
};

const normalizeDatabase = (database: DevDatabase): DevDatabase => ({
  ...database,
  cars: database.cars.map(normalizeCar),
  bookings: normalizeBookings(database.bookings),
  leads: (database.leads ?? []).map((lead) => ({ ...lead, originDomain: lead.originDomain ?? null })),
  locations: database.locations ?? [],
  telegramOperators: database.telegramOperators ?? []
});

export class FileStore implements DataStore {
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(private readonly dbPath = defaultDbPath, private readonly seed = createSeedDatabase) {}

  private async readDatabase(): Promise<DevDatabase> {
    try {
      return normalizeDatabase(JSON.parse(await fs.readFile(this.dbPath, "utf8")) as DevDatabase);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return normalizeDatabase(this.seed());
      throw error;
    }
  }

  private async mutate<T>(operation: (database: DevDatabase) => Promise<T> | T) {
    const task = this.writeQueue.then(async () => {
      const database = await this.readDatabase();
      const result = await operation(database);
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      const temporaryPath = `${this.dbPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
      await fs.writeFile(temporaryPath, JSON.stringify(database, null, 2), "utf8");
      await fs.rename(temporaryPath, this.dbPath);
      return result;
    });
    this.writeQueue = task.then(() => undefined, () => undefined);
    return task;
  }

  async getCars(options?: { includeHidden?: boolean }) {
    const database = await this.readDatabase();
    return database.cars.filter((item) => options?.includeHidden || item.published).sort((a, b) => a.recommendedOrder - b.recommendedOrder);
  }

  async getCarBySlug(slug: string, options?: { includeHidden?: boolean }) {
    const database = await this.readDatabase();
    return database.cars.find((item) => item.slug === slug && (options?.includeHidden || item.published)) ?? null;
  }

  async getCarById(id: string) {
    return (await this.readDatabase()).cars.find((item) => item.id === id) ?? null;
  }

  async saveCar(car: Car) {
    return this.mutate((database) => {
      if (car.published && car.available && (car.minimumAge === null || car.minimumDrivingExperience === null || car.minimumRentalDays === null)) {
        throw new DomainError("POLICY_NOT_CONFIGURED", "Нельзя принимать заявки без возраста, стажа и минимального срока", 422);
      }
      if (database.cars.some((item) => item.slug === car.slug && item.id !== car.id)) {
        throw new DomainError("DUPLICATE_SLUG", "Автомобиль с таким slug уже существует", 409);
      }
      const index = database.cars.findIndex((item) => item.id === car.id);
      if (index < 0) database.cars.push(normalizeCar(car));
      else database.cars[index] = normalizeCar(car);
      return car;
    });
  }

  async deleteCar(id: string) {
    await this.mutate((database) => {
      if (database.bookings.some((booking) => booking.carId === id) || database.leads.some((lead) => lead.carId === id)) {
        throw new DomainError("VALIDATION_ERROR", "Нельзя удалить автомобиль с заявками: снимите его с публикации", 409);
      }
      database.cars = database.cars.filter((item) => item.id !== id);
    });
  }

  async getServices(options?: { includeHidden?: boolean }) {
    return (await this.readDatabase()).services.filter((item) => options?.includeHidden || item.published).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async saveService(service: Service) {
    return this.mutate((database) => {
      if (database.services.some((item) => item.slug === service.slug && item.id !== service.id)) {
        throw new DomainError("DUPLICATE_SLUG", "Услуга с таким slug уже существует", 409);
      }
      const index = database.services.findIndex((item) => item.id === service.id);
      if (index < 0) database.services.push(service);
      else database.services[index] = service;
      return service;
    });
  }

  async deleteService(id: string) {
    await this.mutate((database) => {
      if (database.bookings.some((booking) => booking.additionalServiceIds.includes(id))) {
        throw new DomainError("VALIDATION_ERROR", "Нельзя удалить услугу, использованную в заявках: снимите её с публикации", 409);
      }
      database.services = database.services.filter((item) => item.id !== id);
    });
  }

  async getFaqs(options?: { includeHidden?: boolean }) {
    return (await this.readDatabase()).faqs.filter((item) => options?.includeHidden || item.published).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async saveFaq(faq: Faq) {
    return this.mutate((database) => {
      const index = database.faqs.findIndex((item) => item.id === faq.id);
      if (index < 0) database.faqs.push(faq);
      else database.faqs[index] = faq;
      return faq;
    });
  }

  async deleteFaq(id: string) {
    await this.mutate((database) => { database.faqs = database.faqs.filter((item) => item.id !== id); });
  }

  async getLocations(options?: { includeHidden?: boolean }) {
    return (await this.readDatabase()).locations
      .filter((item) => options?.includeHidden || item.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getLocationBySlug(slug: string, options?: { includeHidden?: boolean }) {
    return (await this.readDatabase()).locations
      .find((item) => item.slug === slug && (options?.includeHidden || item.published)) ?? null;
  }

  async saveLocation(location: Location) {
    return this.mutate((database) => {
      if (database.locations.some((item) => item.slug === location.slug && item.id !== location.id)) {
        throw new DomainError("DUPLICATE_SLUG", "Локация с таким slug уже существует", 409);
      }
      const index = database.locations.findIndex((item) => item.id === location.id);
      if (index < 0) database.locations.push(location);
      else database.locations[index] = location;
      return location;
    });
  }

  async deleteLocation(id: string) {
    await this.mutate((database) => { database.locations = database.locations.filter((item) => item.id !== id); });
  }

  async isCarAvailable(carId: string, startDate: string, endDate: string) {
    const database = await this.readDatabase();
    const car = database.cars.find((item) => item.id === carId);
    if (!car?.published || !car.available) return false;
    try {
      assertRentalPeriod({ startDate, endDate, minimumRentalDays: car.minimumRentalDays ?? 1 });
    } catch {
      return false;
    }
    return !hasBookingConflict(database.bookings, carId, startDate, endDate);
  }

  async createBooking(input: BookingInput, originDomain: OriginDomain | null = null): Promise<Booking> {
    return this.mutate((database) => {
      const existing = database.bookings.find((item) => item.idempotencyKey === input.idempotencyKey);
      if (existing) return existing;
      const car = database.cars.find((item) => item.id === input.carId);
      if (!car) throw new DomainError("NOT_FOUND", "Автомобиль не найден", 404);
      const prepared = prepareBooking(input, car, database.services);
      if (hasBookingConflict(database.bookings, car.id, input.startAt, input.endAt)) {
        throw new DomainError("BOOKING_CONFLICT", "Автомобиль уже занят на выбранный период. Выберите другие даты.", 409);
      }
      const booking: Booking = {
        id: crypto.randomUUID(),
        bookingNumber: Math.max(0, ...database.bookings.map((item) => item.bookingNumber)) + 1,
        carId: car.id,
        carTitle: car.title,
        startAt: input.startAt,
        endAt: input.endAt,
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
        minimumDrivingExperienceApplied: prepared.driverRequirements.minimumExperienceMonths,
        minimumRentalDaysApplied: car.minimumRentalDays,
        additionalServiceIds: prepared.serviceSnapshots.map((service) => service.id),
        additionalServicesSnapshot: prepared.serviceSnapshots,
        comment: input.comment || null,
        rentalDays: prepared.rentalDays,
        pricePerDaySnapshot: car.pricePerDay,
        rentalPrice: prepared.calculation.rentalPrice,
        additionalServicesPrice: prepared.calculation.servicesPrice,
        deposit: prepared.calculation.deposit,
        source: "website_booking",
        originDomain,
        utm: input.utm,
        referrer: input.referrer || null,
        idempotencyKey: input.idempotencyKey,
        privacyConsentAt: prepared.privacyConsentAt,
        status: "NEW",
        createdAt: new Date().toISOString()
      };
      database.bookings.unshift(booking);
      return booking;
    });
  }

  async getBookings() {
    return (await this.readDatabase()).bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createLead(input: DirectLeadInput, originDomain: OriginDomain | null = null): Promise<LeadCreateResult> {
    return this.mutate((database) => {
      const existing = database.leads.find((item) => item.idempotencyKey === input.idempotencyKey);
      if (existing) return { lead: existing, created: false };
      const car = database.cars.find((item) => item.id === input.carId && item.published);
      if (!car) throw new DomainError("NOT_FOUND", "Автомобиль недоступен для заявки", 404);
      const lead: Lead = {
        id: crypto.randomUUID(), carId: car.id, carTitle: car.title, startAt: input.startAt, phone: input.phone,
        source: getPaidTrafficSource(new URLSearchParams(input.utm)) ?? "yandex_direct", originDomain, utm: input.utm, landingPath: input.landingPath, referrer: input.referrer || null,
        idempotencyKey: input.idempotencyKey, privacyConsentAt: new Date().toISOString(), status: "NEW", createdAt: new Date().toISOString()
      };
      database.leads.unshift(lead);
      return { lead, created: true };
    });
  }

  async getLeads() {
    return (await this.readDatabase()).leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    await this.mutate((database) => {
      const booking = database.bookings.find((item) => item.id === id);
      if (!booking) throw new DomainError("NOT_FOUND", "Заявка не найдена", 404);
      assertBookingStatusTransition(booking.status, status);
      booking.status = status;
    });
  }

  async updateInquiryComment(kind: "booking" | "lead", id: string, comment: string | null) {
    await this.mutate((database) => {
      const inquiry = (kind === "booking" ? database.bookings : database.leads).find((item) => item.id === id);
      if (!inquiry) throw new DomainError("NOT_FOUND", "Обращение не найдено", 404);
      inquiry.managerComment = comment;
    });
  }

  async updateLeadStatus(id: string, status: import("@/types/domain").LeadStatus) {
    const validated = parseLeadStatus(status);
    await this.mutate((database) => {
      const lead = database.leads.find((item) => item.id === id);
      if (!lead) throw new DomainError("NOT_FOUND", "Лид не найден", 404);
      lead.status = validated;
    });
  }

  async getTelegramOperators() {
    return (await this.readDatabase()).telegramOperators;
  }

  async getTelegramOperatorByUserId(telegramUserId: string) {
    return (await this.readDatabase()).telegramOperators.find((operator) => operator.telegramUserId === telegramUserId) ?? null;
  }

  async activateTelegramOperator(input: { telegramUserId: string; username: string; bootstrapAdminUsernames: string[] }) {
    return this.mutate((database) => {
      const existingById = database.telegramOperators.find((operator) => operator.telegramUserId === input.telegramUserId);
      if (existingById) return existingById;
      const username = input.username.toLowerCase();
      const existingByUsername = database.telegramOperators.find((operator) => operator.username === username);
      if (existingByUsername) {
        if (existingByUsername.telegramUserId) return null;
        existingByUsername.telegramUserId = input.telegramUserId;
        return existingByUsername;
      }
      if (!input.bootstrapAdminUsernames.map((item) => item.toLowerCase()).includes(username)) return null;
      const operator: TelegramOperator = { id: crypto.randomUUID(), telegramUserId: input.telegramUserId, username, role: "ADMIN", createdAt: new Date().toISOString() };
      database.telegramOperators.push(operator);
      return operator;
    });
  }

  async inviteTelegramOperator(input: { username: string }) {
    return this.mutate((database) => {
      const username = input.username.toLowerCase();
      const existing = database.telegramOperators.find((operator) => operator.username === username);
      if (existing) return existing;
      const operator: TelegramOperator = { id: crypto.randomUUID(), telegramUserId: null, username, role: "OPERATOR", createdAt: new Date().toISOString() };
      database.telegramOperators.push(operator);
      return operator;
    });
  }
}
