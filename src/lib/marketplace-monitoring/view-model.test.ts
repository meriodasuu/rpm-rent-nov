import { describe, expect, it } from "vitest";
import { buildMarketplaceDashboardRows } from "./view-model";

const cars = [
  { id: "car-1", title: "BMW 320i", pricePerDay: 12_000, published: true },
  { id: "car-2", title: "Audi A4", pricePerDay: 11_000, published: true },
];

describe("buildMarketplaceDashboardRows", () => {
  it("shows cars without a link as NOT LINKED", () => {
    expect(buildMarketplaceDashboardRows(cars, [])[0]).toMatchObject({ status: "NOT LINKED", carId: "car-1" });
  });

  it("uses CHECK FAILED before discrepancy severity", () => {
    const rows = buildMarketplaceDashboardRows(cars, [{
      id: "listing-1", carId: "car-1", externalId: "123456", externalUrl: null,
      lastCheckedAt: new Date(), lastErrorCode: "TIMEOUT", lastErrorMessage: "timeout",
      snapshots: [{ createdAt: new Date() }], discrepancies: [{ severity: "CRITICAL" }],
    }]);
    expect(rows[0]).toMatchObject({ status: "CHECK FAILED", statusDetail: "timeout" });
  });

  it.each([
    ["CRITICAL", "CRITICAL"],
    ["ERROR", "ERROR"],
    ["WARNING", "WARNING"],
    ["INFO", "WARNING"],
  ] as const)("maps %s discrepancies to %s", (severity, status) => {
    const rows = buildMarketplaceDashboardRows(cars, [{
      id: "listing-1", carId: "car-1", externalId: "123456", externalUrl: null,
      lastCheckedAt: new Date(), lastErrorCode: null, lastErrorMessage: null,
      snapshots: [{ createdAt: new Date() }], discrepancies: [{ severity }],
    }]);
    expect(rows[0]?.status).toBe(status);
  });

  it("reports OK only after a successful snapshot with no open discrepancies", () => {
    const rows = buildMarketplaceDashboardRows(cars, [{
      id: "listing-1", carId: "car-1", externalId: "123456", externalUrl: "https://www.avito.ru/x_123456",
      lastCheckedAt: new Date(), lastErrorCode: null, lastErrorMessage: null,
      snapshots: [{ createdAt: new Date() }], discrepancies: [],
    }]);
    expect(rows[0]).toMatchObject({ status: "OK", externalId: "123456" });
  });
});
