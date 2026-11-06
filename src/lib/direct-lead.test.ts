import { describe, expect, it } from "vitest";
import { directLeadSchema } from "./validation";

const validLead = {
  carId: "tesla-model-3",
  startAt: "2027-09-01",
  phone: "+7 999 123-45-67",
  privacyConsent: true,
  utm: { utm_source: "yandex", yclid: "123" },
  landingPath: "/cars/tesla-model-3",
  referrer: "https://yandex.ru/",
  idempotencyKey: "6dba29c0-6d76-4c44-94e8-4b3ebcbb6eb3"
};

describe("directLeadSchema", () => {
  it("accepts VK leads and preserves the click ID", () => {
    const utm = { utm_source: "vk", rb_clickid: "vk-click-1" };
    expect(directLeadSchema.parse({ ...validLead, utm }).utm).toEqual(utm);
  });
  it("accepts the minimal Direct lead without booking-only fields", () => {
    expect(directLeadSchema.safeParse(validLead).success).toBe(true);
  });

  it("rejects a phone number with too few digits", () => {
    expect(directLeadSchema.safeParse({ ...validLead, phone: "+7 12" }).success).toBe(false);
  });

  it("rejects a lead without personal-data consent", () => {
    expect(directLeadSchema.safeParse({ ...validLead, privacyConsent: false }).success).toBe(false);
  });

  it("rejects a lead without a Yandex Direct attribution marker", () => {
    expect(directLeadSchema.safeParse({ ...validLead, utm: { utm_source: "google" } }).success).toBe(false);
  });

  it("rejects a start date in the past", () => {
    expect(directLeadSchema.safeParse({ ...validLead, startAt: "2020-01-01" }).success).toBe(false);
  });
});
