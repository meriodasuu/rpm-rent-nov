import { describe, expect, it } from "vitest";
import { calculateRental, calculateRentalDays } from "./rental";

describe("rental calculation", () => {
  it("counts exact calendar days without timezone or DST rounding", () => {
    expect(calculateRentalDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(calculateRentalDays("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("keeps deposit separate from the preliminary amount", () => {
    expect(calculateRental({ startDate: "2026-08-08", endDate: "2026-08-11", pricePerDay: 20_000, deposit: 30_000, servicePrices: [2_500, 1_000] }))
      .toEqual({ days: 3, rentalPrice: 60_000, servicesPrice: 3_500, deposit: 30_000, dueWithoutDeposit: 63_500 });
  });

  it("rejects negative, fractional and overflowing money instead of clamping it", () => {
    expect(() => calculateRental({ startDate: "2026-08-08", endDate: "2026-08-11", pricePerDay: -1, deposit: 0, servicePrices: [] })).toThrow();
    expect(() => calculateRental({ startDate: "2026-08-08", endDate: "2026-08-11", pricePerDay: 1.5, deposit: 0, servicePrices: [] })).toThrow();
    expect(() => calculateRental({ startDate: "2026-08-08", endDate: "2026-08-11", pricePerDay: 1_000_000_000, deposit: 0, servicePrices: [] })).toThrow();
  });
});

