import type { CanonicalMarketplaceListing, MarketplaceFieldComparison } from "@/lib/marketplaces/contracts";

const normalizeText = (value: string) => value
  .normalize("NFKC")
  .toLocaleLowerCase("ru-RU")
  .replace(/[\p{P}\p{S}]+/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

const compareValue = <T extends string | number | boolean>(
  fieldCode: MarketplaceFieldComparison["fieldCode"],
  severity: MarketplaceFieldComparison["severity"],
  masterValue: T,
  external: CanonicalMarketplaceListing["title"] | CanonicalMarketplaceListing["price"] | CanonicalMarketplaceListing["publicationActive"],
  equals: (master: T, observed: T) => boolean,
): MarketplaceFieldComparison => {
  if (external.availability === "NOT_AVAILABLE") {
    return { fieldCode, status: "NOT_AVAILABLE", severity, masterValue, externalValue: null };
  }
  const externalValue = external.value as T;
  return {
    fieldCode,
    status: equals(masterValue, externalValue) ? "MATCH" : "MISMATCH",
    severity,
    masterValue,
    externalValue,
  };
};

export function compareMarketplaceListing(
  master: { title: string; pricePerDay: number; published: boolean; available: boolean },
  observed: CanonicalMarketplaceListing,
): MarketplaceFieldComparison[] {
  return [
    compareValue("PRICE", "CRITICAL", master.pricePerDay, observed.price, (left, right) => left === right),
    compareValue("PUBLICATION_STATUS", "CRITICAL", master.published, observed.publicationActive, (left, right) => left === right),
    compareValue("TITLE", "WARNING", master.title, observed.title, (left, right) => normalizeText(left) === normalizeText(right)),
  ];
}
