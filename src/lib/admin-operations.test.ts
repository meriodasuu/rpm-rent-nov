import { describe, expect, it } from "vitest";
import type { Booking, BookingStatus, Car } from "@/types/domain";
import {
  bookingOccupiesDay,
  buildCalendarDays,
  filterAdminBookings,
  getAdminSummary,
  getBookingAgeLabel,
  getNextActiveBooking,
  getSafeAdminReturnTo,
  parseAdminBookingFilter
} from "./admin-operations";

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: "booking-1",
  carId: "car-1",
  carTitle: "Porsche 911 Carrera 4S",
  startAt: "2026-08-12",
  endAt: "2026-08-14",
  pickupMethod: "office",
  deliveryAddress: null,
  customerName: "Иван Петров",
  phone: "+7 999 111-22-33",
  telegram: "ivan_petrov",
  birthDate: "1990-02-02",
  licenseIssuedOn: "2012-05-10",
  driverAgeAtStart: 36,
  drivingExperienceMonths: 171,
  minimumAgeApplied: 25,
  minimumDrivingExperienceApplied: 36,
  minimumRentalDaysApplied: 1,
  additionalServiceIds: [],
  additionalServicesSnapshot: [],
  comment: null,
  rentalDays: 3,
  pricePerDaySnapshot: 27900,
  rentalPrice: 83700,
  additionalServicesPrice: 0,
  deposit: 100000,
  source: "site",
  utm: {},
  referrer: null,
  idempotencyKey: "idem-1",
  privacyConsentAt: "2026-08-12T07:00:00.000Z",
  status: "NEW",
  createdAt: "2026-08-12T06:30:00.000Z",
  ...overrides,
  bookingNumber: overrides.bookingNumber ?? 1,
  originDomain: overrides.originDomain ?? null
});

const car = (id: string): Car => ({
  id,
  slug: id,
  brand: "RPM",
  model: id,
  title: id,
  category: "Спорт",
  bodyType: "Купе",
  vehicleClass: "Премиум",
  year: 2025,
  transmission: "Автомат",
  engine: null,
  horsepower: null,
  driveType: null,
  seats: 2,
  shortDescription: "",
  description: "",
  pricePerDay: 10000,
  oldPrice: null,
  deposit: 50000,
  minimumAge: 25,
  minimumDrivingExperience: 36,
  minimumRentalDays: 1,
  mileageLimit: null,
  extraMileagePrice: null,
  insurance: null,
  images: [],
  features: [],
  rentalConditions: [],
  available: true,
  published: true,
  isNew: false,
  isPromotion: false,
  isDemo: false,
  recommendedOrder: 1,
  seoTitle: null,
  seoDescription: null
});

const now = new Date("2026-08-12T09:00:00.000Z");

describe("admin booking controls", () => {
  it("parses filters and accepts only booking-workspace return locations", () => {
    expect(parseAdminBookingFilter("attention")).toBe("attention");
    expect(parseAdminBookingFilter("CONFIRMED")).toBe("CONFIRMED");
    expect(parseAdminBookingFilter("unknown")).toBe("attention");
    expect(getSafeAdminReturnTo("/admin/bookings?booking=booking-1&filter=today")).toBe("/admin/bookings?booking=booking-1&filter=today");
    expect(getSafeAdminReturnTo("https://example.com/admin/bookings")).toBe("/admin/bookings");
    expect(getSafeAdminReturnTo("//example.com")).toBe("/admin/bookings");
    expect(getSafeAdminReturnTo("/admin/cars")).toBe("/admin/bookings");
  });
});

describe("getAdminSummary", () => {
  it("returns actionable counts for the current Moscow business day", () => {
    const bookings = [
      booking(),
      booking({ id: "booking-2", status: "IN_PROGRESS", carId: "car-2" }),
      booking({ id: "booking-3", status: "CONFIRMED", carId: "car-3", endAt: "2026-08-12" }),
      booking({ id: "booking-4", status: "CANCELLED", carId: "car-4" })
    ];

    expect(getAdminSummary(bookings, [car("car-1"), car("car-2"), car("car-3")], now)).toEqual({
      attention: 2,
      pickupsToday: 1,
      returnsToday: 1,
      occupiedCars: 1,
      availableCars: 2
    });
  });
});

describe("filterAdminBookings", () => {
  const bookings = [
    booking(),
    booking({ id: "booking-2", status: "CONFIRMED", carId: "car-2", carTitle: "Lamborghini Urus", customerName: "Анна Смирнова", phone: "+7 999 222-33-44", createdAt: "2026-08-12T07:00:00.000Z" }),
    booking({ id: "booking-3", status: "COMPLETED", carId: "car-3", carTitle: "BMW M4", customerName: "Павел Волков", createdAt: "2026-08-10T06:30:00.000Z" })
  ];

  it("filters attention requests and searches across operational fields", () => {
    expect(filterAdminBookings(bookings, "attention", "porsche", now).map((item) => item.id)).toEqual(["booking-1"]);
    expect(filterAdminBookings(bookings, "all", "222-33", now).map((item) => item.id)).toEqual(["booking-2"]);
  });

  it("supports lifecycle and today filters", () => {
    expect(filterAdminBookings(bookings, "CONFIRMED", "", now).map((item) => item.id)).toEqual(["booking-2"]);
    expect(filterAdminBookings(bookings, "today", "", now).map((item) => item.id)).toEqual(["booking-2", "booking-1"]);
  });
});

describe("calendar helpers", () => {
  it("builds fourteen consecutive labelled days", () => {
    const days = buildCalendarDays(now, 14);
    expect(days).toHaveLength(14);
    expect(days[0]).toMatchObject({ key: "2026-08-12", isToday: true });
    expect(days[13]?.key).toBe("2026-08-25");
  });

  it("treats only active requests as occupying inclusive dates", () => {
    expect(bookingOccupiesDay(booking({ status: "CONFIRMED" }), "2026-08-13")).toBe(true);
    expect(bookingOccupiesDay(booking({ status: "CANCELLED" }), "2026-08-13")).toBe(false);
    expect(bookingOccupiesDay(booking({ status: "CONFIRMED" }), "2026-08-15")).toBe(false);
  });
});

describe("operational labels", () => {
  it("returns a compact age label", () => {
    expect(getBookingAgeLabel(booking(), now)).toBe("2 ч");
    expect(getBookingAgeLabel(booking({ createdAt: "2026-08-11T06:30:00.000Z" }), now)).toBe("1 дн");
  });

  it("finds the nearest active booking for a car", () => {
    const statuses: BookingStatus[] = ["CANCELLED", "CONFIRMED", "NEW"];
    const bookings = statuses.map((status, index) => booking({ id: `booking-${index}`, status, startAt: `2026-08-${13 + index}`, endAt: `2026-08-${14 + index}` }));
    expect(getNextActiveBooking(bookings, "car-1", now)?.id).toBe("booking-1");
  });
});
