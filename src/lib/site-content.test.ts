import { describe, expect, it } from "vitest";
import { CONTACTS, LOCATIONS, ROUTE_CATEGORIES, normalizeSocialUrl } from "./site-content";

describe("normalizeSocialUrl", () => {
  it("turns Telegram and Instagram handles into HTTPS links", () => {
    expect(normalizeSocialUrl("telegram", "@rpmrent")).toBe("https://t.me/rpmrent");
    expect(normalizeSocialUrl("instagram", "rpm_rent")).toBe("https://www.instagram.com/rpm_rent");
  });

  it("keeps a complete HTTPS URL", () => {
    expect(normalizeSocialUrl("generic", "https://vk.ru/rpm_rent")).toBe("https://vk.ru/rpm_rent");
  });
});

describe("public site content", () => {
  it("contains the supplied contact details and safe external links", () => {
    expect(CONTACTS.phone).toBe("+7 993 983-80-80");
    expect(CONTACTS.max.phone).toBe("+7 993 983-80-80");
    expect(CONTACTS.max.href).toBe("https://max.ru/");
    expect(CONTACTS.socials[0]).toEqual({ label: "MAX", href: "https://max.ru/" });
    expect(CONTACTS.address).toBe("Санкт-Петербург, Пискаревский проспект, 144АК, 2 этаж");
    expect(CONTACTS.socials).toHaveLength(8);
    expect(CONTACTS.socials.every((item) => item.href.startsWith("https://"))).toBe(true);
  });

  it("provides filter destinations for every location and route category", () => {
    expect(LOCATIONS).toHaveLength(4);
    expect(ROUTE_CATEGORIES).toHaveLength(4);
    expect([...LOCATIONS, ...ROUTE_CATEGORIES].every((item) => item.href.startsWith("/cars"))).toBe(true);
  });
});
