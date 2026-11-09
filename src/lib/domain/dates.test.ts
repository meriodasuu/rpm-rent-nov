import { describe, expect, it } from "vitest";
import { assertRentalPeriod, completedMonthsAt, completedYearsAt, normalizeStoredDate, parseDateOnly, todayInBusinessTimeZone } from "./dates";

describe("calendar date rules", () => {
  const now = new Date("2026-08-09T10:00:00Z");

  it("strictly parses real YYYY-MM-DD values", () => {
    expect(parseDateOnly("2028-02-29")).toBeInstanceOf(Date);
    expect(parseDateOnly("2027-02-29")).toBeNull();
    expect(parseDateOnly("2027-01-01T00:00:00Z")).toBeNull();
  });

  it("uses the Moscow business date and allows today", () => {
    expect(todayInBusinessTimeZone(new Date("2026-08-08T21:30:00Z"))).toBe("2026-08-09");
    expect(normalizeStoredDate("2026-08-08T21:00:00.000Z")).toBe("2026-08-09");
    expect(assertRentalPeriod({ startDate: "2026-08-09", endDate: "2026-08-10", now })).toBe(1);
  });

  it.each([
    ["2026-08-08", "2026-08-10", "past"],
    ["2026-08-10", "2026-08-10", "zero"],
    ["2026-08-11", "2026-08-10", "reverse"],
    ["2026-08-10", "2027-08-12", "too long"],
    ["2028-08-10", "2028-08-11", "too far"]
  ])("rejects %s → %s (%s)", (startDate, endDate) => {
    expect(() => assertRentalPeriod({ startDate, endDate, now })).toThrow();
  });

  it("enforces a configured minimum period", () => {
    expect(() => assertRentalPeriod({ startDate: "2026-08-10", endDate: "2026-08-12", minimumRentalDays: 3, now })).toThrow("Минимальный срок");
  });

  it("handles birthday, leap-day and month boundaries", () => {
    expect(completedYearsAt("2008-08-10", "2026-08-09")).toBe(17);
    expect(completedYearsAt("2008-08-10", "2026-08-10")).toBe(18);
    expect(completedYearsAt("2008-02-29", "2026-03-01")).toBe(18);
    expect(completedMonthsAt("2025-01-15", "2026-01-14")).toBe(11);
    expect(completedMonthsAt("2025-01-15", "2026-01-15")).toBe(12);
  });
});
