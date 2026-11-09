import { describe, expect, it } from "vitest";
import { bookingSchema } from "./validation";

const valid = {
  carId: "car-porsche-911",
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
  idempotencyKey: "faee9568-35e2-41d4-860b-65e01b0e9bdf"
} as const;

describe("booking validation", () => {
  it("accepts a complete date-only request", () => expect(bookingSchema.safeParse(valid).success).toBe(true));

  it.each<readonly [unknown, string]>([
    [{ ...valid, startAt: "2027-01-10T00:00:00Z" }, "ISO timestamp"],
    [{ ...valid, endAt: "2027-01-10" }, "zero period"],
    [{ ...valid, endAt: "2027-01-09" }, "reverse period"],
    [{ ...valid, phone: "not-a-phone<script>" }, "invalid phone"],
    [{ ...valid, privacyConsent: false }, "missing consent"],
    [{ ...valid, additionalServiceIds: ["service-1", "service-1"] }, "duplicate service"],
    [{ ...valid, pickupMethod: "delivery", deliveryAddress: "" }, "delivery without address"],
    [{ ...valid, status: "CONFIRMED" }, "status mass assignment"],
    [{ ...valid, rentalPrice: 1 }, "price mass assignment"],
    [{ ...valid, drivingExperienceMonths: 900 }, "experience mass assignment"],
    [{ ...valid, source: "spoofed" }, "source mass assignment"],
    [{ ...valid, comment: "<script>alert(1)</script>" }, "script-like comment"]
  ])("rejects invalid payload: %s (%s)", (payload) => expect(bookingSchema.safeParse(payload).success).toBe(false));
});
