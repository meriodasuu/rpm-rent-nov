import { describe, expect, it } from "vitest";
import { compareMarketplaceListing } from "./comparison";
import { marketplaceValue, unavailableMarketplaceValue, type CanonicalMarketplaceListing } from "@/lib/marketplaces/contracts";

const master = {
  title: "BMW M4 Competition",
  pricePerDay: 25_000,
  published: true,
  available: true,
};

const observed = (overrides: Partial<CanonicalMarketplaceListing> = {}): CanonicalMarketplaceListing => ({
  externalId: "123456789",
  externalUrl: "https://www.avito.ru/sankt-peterburg/avtomobili/bmw_m4_123456789",
  title: marketplaceValue("BMW M4 Competition"),
  price: marketplaceValue(25_000),
  publicationActive: marketplaceValue(true),
  platformStatus: "active",
  ...overrides,
});

describe("compareMarketplaceListing", () => {
  it("matches equal canonical numbers instead of formatted strings", () => {
    const price = compareMarketplaceListing(master, observed()).find((item) => item.fieldCode === "PRICE");
    expect(price).toMatchObject({ status: "MATCH", severity: "CRITICAL", masterValue: 25_000, externalValue: 25_000 });
  });

  it("marks a different price as critical", () => {
    const price = compareMarketplaceListing(master, observed({ price: marketplaceValue(27_000) })).find((item) => item.fieldCode === "PRICE");
    expect(price).toMatchObject({ status: "MISMATCH", severity: "CRITICAL", masterValue: 25_000, externalValue: 27_000 });
  });

  it("normalizes title case, punctuation and whitespace", () => {
    const title = compareMarketplaceListing(master, observed({ title: marketplaceValue("  bmw   m4 competition! ") })).find((item) => item.fieldCode === "TITLE");
    expect(title).toMatchObject({ status: "MATCH", severity: "WARNING" });
  });

  it("does not treat an unsupported platform value as a discrepancy", () => {
    const price = compareMarketplaceListing(master, observed({ price: unavailableMarketplaceValue("not supplied by endpoint") })).find((item) => item.fieldCode === "PRICE");
    expect(price).toMatchObject({ status: "NOT_AVAILABLE", severity: "CRITICAL", masterValue: 25_000, externalValue: null });
  });

  it("detects the critical opposite availability state", () => {
    const availability = compareMarketplaceListing(master, observed({ publicationActive: marketplaceValue(false) })).find((item) => item.fieldCode === "PUBLICATION_STATUS");
    expect(availability).toMatchObject({ status: "MISMATCH", severity: "CRITICAL", masterValue: true, externalValue: false });
  });

  it("compares Avito publication state to RPM publication, not rental availability", () => {
    const availability = compareMarketplaceListing({ ...master, available: false }, observed()).find((item) => item.fieldCode === "PUBLICATION_STATUS");
    expect(availability).toMatchObject({ status: "MATCH", masterValue: true, externalValue: true });
  });
});
