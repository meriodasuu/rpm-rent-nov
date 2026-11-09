import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSeedDatabase } from "@/data/seed";
import { bookingSchema, directLeadSchema, type BookingInput } from "@/lib/validation";
import type { DevDatabase } from "@/types/domain";
import { FileStore } from "./file-store";

const buildSeed = (): DevDatabase => {
  const database = createSeedDatabase();
  database.cars = database.cars.map((car, index) => index === 0 ? { ...car, available: true, published: true, minimumAge: 18, minimumDrivingExperience: 12, minimumRentalDays: 2 } : car);
  return database;
};

const bookingInput = (overrides: Partial<BookingInput> = {}) => bookingSchema.parse({
  carId: buildSeed().cars[0]!.id,
  startAt: "2027-01-10",
  endAt: "2027-01-12",
  pickupMethod: "office",
  deliveryAddress: "",
  customerName: "Иван",
  phone: "+7 999 111-22-33",
  telegram: "@ivan_77",
  additionalServiceIds: [],
  comment: "",
  privacyConsent: true,
  utm: {},
  referrer: "",
  idempotencyKey: crypto.randomUUID(),
  ...overrides
});

describe("FileStore booking integrity", () => {
  let directory = "";
  let store: FileStore;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "rpm-rent-test-"));
    store = new FileStore(path.join(directory, "db.json"), buildSeed);
  });

  afterEach(async () => {
    if (directory) await fs.rm(directory, { recursive: true, force: true });
  });

  it("serializes concurrent overlapping requests so exactly one wins", async () => {
    const results = await Promise.allSettled([
      store.createBooking(bookingInput()),
      store.createBooking(bookingInput())
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected && rejected.status === "rejected" ? rejected.reason.message : "").toContain("уже занят");
  });

  it("persists and clears manager comments for both inquiry kinds without changing client comments or status", async () => {
    const booking = await store.createBooking(bookingInput({ comment: "Нужна доставка" }));
    const { lead } = await store.createLead(directLeadSchema.parse({
      carId: buildSeed().cars[0]!.id, startAt: "2027-01-10", phone: "+7 999 111-22-33", privacyConsent: true,
      utm: { utm_source: "yandex" }, landingPath: "/cars/test", referrer: "", idempotencyKey: crypto.randomUUID()
    }));
    await store.updateInquiryComment("booking", booking.id, "Согласовано\nК 12:00");
    await store.updateInquiryComment("lead", lead.id, "Перезвонить");
    const reopened = new FileStore(path.join(directory, "db.json"), buildSeed);
    expect((await reopened.getBookings())[0]).toMatchObject({ comment: "Нужна доставка", managerComment: "Согласовано\nК 12:00", status: "NEW" });
    expect((await reopened.getLeads())[0]).toMatchObject({ managerComment: "Перезвонить", status: "NEW" });
    await reopened.updateInquiryComment("booking", booking.id, null);
    await reopened.updateInquiryComment("lead", lead.id, null);
    expect((await store.getBookings())[0]?.managerComment).toBeNull();
    expect((await store.getLeads())[0]?.managerComment).toBeNull();
    await expect(store.updateInquiryComment("booking", lead.id, "wrong kind")).rejects.toThrow("Обращение не найдено");
  });

  it("returns the original booking for an idempotent retry", async () => {
    const input = bookingInput();
    const first = await store.createBooking(input);
    const second = await store.createBooking(input);
    expect(second.id).toBe(first.id);
    expect((await store.getBookings())).toHaveLength(1);
  });

  it("stores an idempotent Direct lead without reserving the requested date", async () => {
    const input = directLeadSchema.parse({
      carId: buildSeed().cars[0]!.id, startAt: "2027-01-10", phone: "+7 999 111-22-33", privacyConsent: true,
      utm: { utm_source: "yandex", yclid: "123" }, landingPath: "/cars/test", referrer: "", idempotencyKey: crypto.randomUUID()
    });
    const first = await store.createLead(input);
    const second = await store.createLead(input);
    expect(second.lead.id).toBe(first.lead.id);
    expect((await store.getLeads())).toHaveLength(1);
    await expect(store.createBooking(bookingInput())).resolves.toMatchObject({ status: "NEW" });
  });

  it("persists lead status changes without changing bookings or availability", async () => {
    const input = directLeadSchema.parse({
      carId: buildSeed().cars[0]!.id, startAt: "2027-01-10", phone: "+7 999 111-22-33", privacyConsent: true,
      utm: { utm_source: "yandex" }, landingPath: "/cars/test", referrer: "", idempotencyKey: crypto.randomUUID()
    });
    const { lead } = await store.createLead(input);
    for (const status of ["IN_PROGRESS", "COMPLETED", "DECLINED", "NEW"] as const) {
      await store.updateLeadStatus(lead.id, status);
      const reopened = new FileStore(path.join(directory, "db.json"), buildSeed);
      expect((await reopened.getLeads())[0]?.status).toBe(status);
    }
    await expect(store.updateLeadStatus("missing", "IN_PROGRESS")).rejects.toThrow("Лид не найден");
    expect(await store.getBookings()).toEqual([]);
    await expect(store.createBooking(bookingInput())).resolves.toMatchObject({ status: "NEW" });
  });

  it("stores a new request without birth or driving licence dates", async () => {
    const booking = await store.createBooking(bookingInput());

    expect(booking).toMatchObject({
      birthDate: null,
      licenseIssuedOn: null,
      driverAgeAtStart: null,
      drivingExperienceMonths: null,
    });
  });

  it("persists VK attribution across reopening and duplicate requests", async () => {
    const input = directLeadSchema.parse({
      carId: buildSeed().cars[0]!.id, startAt: "2027-02-10", phone: "+7 999 111-22-33", privacyConsent: true,
      utm: { utm_source: "vk", rb_clickid: "vk-click" }, landingPath: "/cars/test", referrer: "", idempotencyKey: crypto.randomUUID()
    });
    const created = await store.createLead(input, "rpmrent.ru");
    expect(created.lead.source).toBe("vk_ads");
    expect((await store.createLead(input)).created).toBe(false);
    expect((await store.getLeads()).find((item) => item.id === created.lead.id)).toMatchObject({ source: "vk_ads", utm: input.utm });
  });

  it("persists the originating domain for bookings and Direct leads", async () => {
    const booking = await store.createBooking(bookingInput(), "rpm-rent.ru");
    const leadInput = directLeadSchema.parse({
      carId: buildSeed().cars[0]!.id, startAt: "2027-02-10", phone: "+7 999 111-22-33", privacyConsent: true,
      utm: { utm_source: "yandex" }, landingPath: "/cars/test", referrer: "", idempotencyKey: crypto.randomUUID()
    });
    const { lead } = await store.createLead(leadInput, "rpmrent.ru");

    expect(booking.originDomain).toBe("rpm-rent.ru");
    expect(lead.originDomain).toBe("rpmrent.ru");
  });

  it("releases dates after cancellation but not while the request is active", async () => {
    const first = await store.createBooking(bookingInput());
    await expect(store.createBooking(bookingInput())).rejects.toThrow("уже занят");
    await store.updateBookingStatus(first.id, "CANCELLED");
    await expect(store.createBooking(bookingInput())).resolves.toMatchObject({ status: "NEW" });
  });

  it("enforces lifecycle transitions in the persistence layer", async () => {
    const booking = await store.createBooking(bookingInput());
    await store.updateBookingStatus(booking.id, "CONFIRMED");
    await store.updateBookingStatus(booking.id, "COMPLETED");
    await expect(store.updateBookingStatus(booking.id, "NEW")).rejects.toThrow("запрещён");
  });

  it("preserves historical car, service, price and policy snapshots", async () => {
    const database = buildSeed();
    const service = database.services.find((item) => item.published)!;
    store = new FileStore(path.join(directory, "snapshots.json"), () => database);
    const created = await store.createBooking(bookingInput({ additionalServiceIds: [service.id] }));
    const car = (await store.getCarById(created.carId))!;
    await store.saveCar({ ...car, title: "Renamed", pricePerDay: car.pricePerDay + 10_000, minimumAge: 25 });
    const saved = (await store.getBookings())[0]!;
    expect(saved.carTitle).toBe(created.carTitle);
    expect(saved.pricePerDaySnapshot).toBe(created.pricePerDaySnapshot);
    expect(saved.minimumAgeApplied).toBe(18);
    expect(saved.additionalServicesSnapshot[0]).toMatchObject({ id: service.id, title: service.title, price: service.price ?? 0 });
    await expect(store.deleteService(service.id)).rejects.toThrow("использованную в заявках");
  });

  it("rejects unavailable cars, unknown services and duplicate slugs", async () => {
    const car = (await store.getCars({ includeHidden: true }))[0]!;
    await store.saveCar({ ...car, available: false });
    await expect(store.createBooking(bookingInput())).rejects.toThrow("недоступен");
    await store.saveCar({ ...car, available: true });
    await expect(store.createBooking(bookingInput({ additionalServiceIds: ["missing-service"] }))).rejects.toThrow("услуг");
    const another = (await store.getCars({ includeHidden: true }))[1]!;
    await expect(store.saveCar({ ...another, slug: car.slug })).rejects.toThrow("slug");
  });

  it("hides legacy internal copy when reading an existing database", async () => {
    const database = buildSeed();
    database.cars[0] = { ...database.cars[0]!, shortDescription: "Импортировано из рабочего стандарта RPM.", description: "Импортировано из рабочего стандарта RPM." };
    store = new FileStore(path.join(directory, "legacy-copy.json"), () => database);

    const car = (await store.getCars({ includeHidden: true }))[0]!;

    expect(car.shortDescription).not.toMatch(/импортировано|рабочего стандарта/i);
    expect(car.description).not.toMatch(/импортировано|рабочего стандарта/i);
  });

  it("protects booking history from car deletion", async () => {
    const booking = await store.createBooking(bookingInput());
    await expect(store.deleteCar(booking.carId)).rejects.toThrow("с заявками");
  });
});
