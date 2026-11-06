import { describe, expect, it } from "vitest";
import { normalizeAvitoListing, parseAvitoListingReference } from "./avito";

describe("normalizeAvitoListing", () => {
  it("normalizes the documented list item fields", () => {
    expect(normalizeAvitoListing({
      id: 123456789,
      title: "BMW M4 Competition",
      price: 25_000,
      status: "active",
      url: "https://www.avito.ru/sankt-peterburg/avtomobili/bmw_m4_123456789",
      category: { id: 9, name: "Автомобили" },
    })).toMatchObject({
      externalId: "123456789",
      title: { availability: "VALUE", value: "BMW M4 Competition" },
      price: { availability: "VALUE", value: 25_000 },
      publicationActive: { availability: "VALUE", value: true },
      platformStatus: "active",
    });
  });

  it("distinguishes a missing price from zero", () => {
    const normalized = normalizeAvitoListing({ id: 123456789, title: "BMW M4", price: null, status: "active", url: null, category: { id: 9, name: "Автомобили" } });
    expect(normalized.price).toEqual({ availability: "NOT_AVAILABLE", reason: "not supplied by Avito" });
  });

  it("normalizes omitted optional fields as NOT_AVAILABLE", () => {
    const normalized = normalizeAvitoListing({ id: 123456789 });
    expect(normalized.title).toMatchObject({ availability: "NOT_AVAILABLE" });
    expect(normalized.price).toMatchObject({ availability: "NOT_AVAILABLE" });
    expect(normalized.publicationActive).toMatchObject({ availability: "NOT_AVAILABLE" });
    expect(normalized.platformStatus).toBe("not_supplied");
  });

  it("normalizes every documented non-active status as unavailable", () => {
    for (const status of ["removed", "old", "blocked", "rejected"] as const) {
      expect(normalizeAvitoListing({ id: 123456789, title: "BMW M4", price: 0, status, url: null, category: { id: 9, name: "Автомобили" } }).publicationActive)
        .toEqual({ availability: "VALUE", value: false });
    }
  });
});

describe("parseAvitoListingReference", () => {
  it("accepts a numeric external id", () => {
    expect(parseAvitoListingReference("123456789")).toBe("123456789");
  });

  it("extracts an id from a validated Avito HTTPS URL", () => {
    expect(parseAvitoListingReference("https://www.avito.ru/sankt-peterburg/avtomobili/bmw_m4_123456789?context=H4sIA"))
      .toBe("123456789");
  });

  it("rejects arbitrary hosts and non-HTTPS URLs", () => {
    expect(() => parseAvitoListingReference("https://example.com/bmw_m4_123456789")).toThrow("Авито");
    expect(() => parseAvitoListingReference("http://www.avito.ru/bmw_m4_123456789")).toThrow("HTTPS");
  });
});
