import { describe, expect, it } from "vitest";
import { prepareBooking, type BookingCar } from "./booking";
import type { BookingInput } from "@/lib/validation";
import type { Service } from "@/types/domain";

const car: BookingCar = { id: "car-1", title: "Car", published: true, available: true, pricePerDay: 20_000, deposit: 30_000, minimumAge: 18, minimumDrivingExperience: 12, minimumRentalDays: 2 };
const service: Service = { id: "service-1", slug: "delivery", title: "Доставка", description: "Доставка", price: 2_500, published: true, sortOrder: 1 };
const input: BookingInput = { carId: car.id, startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "", customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [service.id], comment: "", privacyConsent: true, utm: {}, referrer: "", idempotencyKey: "b9439434-7ff7-4ae9-a9d9-943ce46f3e73" };

describe("booking preparation", () => {
  it("creates immutable policy, service and price snapshots", () => {
    const result = prepareBooking(input, car, [service], new Date("2026-08-09T10:00:00Z"));
    expect(result.calculation).toMatchObject({ days: 2, rentalPrice: 40_000, servicesPrice: 2_500, deposit: 30_000 });
    expect(result.serviceSnapshots).toEqual([{ id: service.id, title: service.title, price: 2_500 }]);
    expect(result.driverRequirements).toEqual({ minimumAge: 18, minimumExperienceMonths: 12 });
  });

  it("fails closed when any business policy is unknown", () => {
    expect(() => prepareBooking(input, { ...car, minimumDrivingExperience: null }, [service], new Date("2026-08-09T10:00:00Z"))).toThrow("ещё не настроены");
  });

  it("rejects unpublished or unknown services", () => {
    expect(() => prepareBooking(input, car, [{ ...service, published: false }], new Date("2026-08-09T10:00:00Z"))).toThrow("услуг");
  });
});
