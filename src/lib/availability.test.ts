import { describe, expect, it } from "vitest";
import { hasBookingConflict, periodsOverlap } from "./availability";
import type { Booking } from "@/types/domain";

const booking = (status: Booking["status"]): Booking => ({
  id: "booking-1", bookingNumber: 1, carId: "car-1", carTitle: "Car", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office",
  deliveryAddress: null, customerName: "Иван", phone: "+79990000000", telegram: null, birthDate: "1990-01-01", licenseIssuedOn: "2010-01-01",
  driverAgeAtStart: 37, drivingExperienceMonths: 204, minimumAgeApplied: 18, minimumDrivingExperienceApplied: 0, minimumRentalDaysApplied: 1,
  additionalServiceIds: [], additionalServicesSnapshot: [], comment: null, rentalDays: 2, pricePerDaySnapshot: 10_000, rentalPrice: 20_000,
  additionalServicesPrice: 0, deposit: 30_000, source: "test", originDomain: null, utm: {}, referrer: null, idempotencyKey: crypto.randomUUID(), privacyConsentAt: new Date().toISOString(), status, createdAt: new Date().toISOString()
});

describe("availability", () => {
  it("uses half-open periods and allows adjacent rentals", () => {
    expect(periodsOverlap("2027-01-10", "2027-01-12", "2027-01-12", "2027-01-13")).toBe(false);
    expect(periodsOverlap("2027-01-10", "2027-01-12", "2027-01-11", "2027-01-13")).toBe(true);
  });

  it.each(["NEW", "IN_PROGRESS", "CONFIRMED"] as const)("treats %s as blocking", (status) => {
    expect(hasBookingConflict([booking(status)], "car-1", "2027-01-11", "2027-01-13")).toBe(true);
  });

  it.each(["DECLINED", "CANCELLED", "COMPLETED"] as const)("releases dates for %s", (status) => {
    expect(hasBookingConflict([booking(status)], "car-1", "2027-01-11", "2027-01-13")).toBe(false);
  });
});
