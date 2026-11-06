import { createHash } from "node:crypto";
import type { MarketplaceFieldComparison, MarketplaceSeverity } from "@/lib/marketplaces/contracts";

export type PersistedDiscrepancy = {
  listingId: string;
  fingerprint: string;
  fieldCode: string;
  masterValue: string;
  externalValue: string;
  severity: MarketplaceSeverity;
  status: "OPEN" | "RESOLVED" | "IGNORED";
  policyVersion: number;
  firstDetectedAt: Date;
  lastDetectedAt: Date;
  resolvedAt: Date | null;
};

export function buildDiscrepancyChanges(
  listingId: string,
  existing: PersistedDiscrepancy[],
  comparisons: MarketplaceFieldComparison[],
  detectedAt: Date,
  policyVersion = 1,
) {
  const serialize = (value: MarketplaceFieldComparison["masterValue"]) => value === null ? "null" : String(value);
  const mismatches = comparisons.filter((comparison) => comparison.status === "MISMATCH");
  const upserts = mismatches.map((comparison): PersistedDiscrepancy => {
    const masterValue = serialize(comparison.masterValue);
    const externalValue = serialize(comparison.externalValue);
    const fingerprint = createHash("sha256").update(JSON.stringify({
      listingId,
      fieldCode: comparison.fieldCode,
      masterValue,
      externalValue,
      policyVersion,
    })).digest("hex");
    const previous = existing.find((item) => item.fingerprint === fingerprint);
    return {
      listingId,
      fingerprint,
      fieldCode: comparison.fieldCode,
      masterValue,
      externalValue,
      severity: comparison.severity,
      status: "OPEN",
      policyVersion,
      firstDetectedAt: previous?.firstDetectedAt ?? detectedAt,
      lastDetectedAt: detectedAt,
      resolvedAt: null,
    };
  });
  const activeFingerprints = new Set(upserts.map((item) => item.fingerprint));
  const conclusivelyCheckedFields = new Set(comparisons
    .filter((item) => item.status === "MATCH" || item.status === "MISMATCH")
    .map((item) => item.fieldCode));
  const resolveFingerprints = existing
    .filter((item) => item.status === "OPEN" && conclusivelyCheckedFields.has(item.fieldCode as MarketplaceFieldComparison["fieldCode"]) && !activeFingerprints.has(item.fingerprint))
    .map((item) => item.fingerprint);
  return { upserts, resolveFingerprints };
}
