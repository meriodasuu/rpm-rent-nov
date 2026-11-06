import { describe, expect, it } from "vitest";
import { buildDiscrepancyChanges, type PersistedDiscrepancy } from "./discrepancy";
import type { MarketplaceFieldComparison } from "@/lib/marketplaces/contracts";

const detectedAt = new Date("2026-08-20T09:00:00.000Z");
const later = new Date("2026-08-20T10:00:00.000Z");
const mismatch = (masterValue: number, externalValue: number): MarketplaceFieldComparison => ({
  fieldCode: "PRICE",
  status: "MISMATCH",
  severity: "CRITICAL",
  masterValue,
  externalValue,
});

const persisted = (comparison: MarketplaceFieldComparison): PersistedDiscrepancy => {
  const first = buildDiscrepancyChanges("listing-1", [], [comparison], detectedAt).upserts[0]!;
  return { ...first, status: "OPEN", resolvedAt: null };
};

describe("buildDiscrepancyChanges", () => {
  it("creates one open discrepancy on first detection", () => {
    const result = buildDiscrepancyChanges("listing-1", [], [mismatch(25_000, 30_000)], detectedAt);
    expect(result.upserts).toHaveLength(1);
    expect(result.upserts[0]).toMatchObject({
      listingId: "listing-1",
      fieldCode: "PRICE",
      masterValue: "25000",
      externalValue: "30000",
      status: "OPEN",
      firstDetectedAt: detectedAt,
      lastDetectedAt: detectedAt,
    });
    expect(result.resolveFingerprints).toEqual([]);
  });

  it("updates lastDetectedAt without duplicating the same mismatch", () => {
    const existing = persisted(mismatch(25_000, 30_000));
    const result = buildDiscrepancyChanges("listing-1", [existing], [mismatch(25_000, 30_000)], later);
    expect(result.upserts).toHaveLength(1);
    expect(result.upserts[0]).toMatchObject({ fingerprint: existing.fingerprint, firstDetectedAt: detectedAt, lastDetectedAt: later });
    expect(result.resolveFingerprints).toEqual([]);
  });

  it("resolves history when the field matches on a later successful check", () => {
    const existing = persisted(mismatch(25_000, 30_000));
    const match: MarketplaceFieldComparison = { ...mismatch(25_000, 25_000), status: "MATCH" };
    const result = buildDiscrepancyChanges("listing-1", [existing], [match], later);
    expect(result.upserts).toEqual([]);
    expect(result.resolveFingerprints).toEqual([existing.fingerprint]);
  });

  it("does not resolve an open discrepancy when the platform value becomes unavailable", () => {
    const existing = persisted(mismatch(25_000, 30_000));
    const unavailable: MarketplaceFieldComparison = { ...mismatch(25_000, 30_000), status: "NOT_AVAILABLE", externalValue: null };
    const result = buildDiscrepancyChanges("listing-1", [existing], [unavailable], later);
    expect(result.upserts).toEqual([]);
    expect(result.resolveFingerprints).toEqual([]);
  });

  it("resolves the old fingerprint and opens a new one when Avito changes again", () => {
    const existing = persisted(mismatch(25_000, 30_000));
    const result = buildDiscrepancyChanges("listing-1", [existing], [mismatch(25_000, 31_000)], later);
    expect(result.upserts[0]?.fingerprint).not.toBe(existing.fingerprint);
    expect(result.resolveFingerprints).toEqual([existing.fingerprint]);
  });

  it("uses a new fingerprint when the RPM master value changes", () => {
    const existing = persisted(mismatch(25_000, 30_000));
    const result = buildDiscrepancyChanges("listing-1", [existing], [mismatch(26_000, 30_000)], later);
    expect(result.upserts[0]?.fingerprint).not.toBe(existing.fingerprint);
    expect(result.resolveFingerprints).toEqual([existing.fingerprint]);
  });
});
