import { marketplaceValue, unavailableMarketplaceValue, type CanonicalMarketplaceListing } from "@/lib/marketplaces/contracts";

export type AvitoRawListing = {
  id: number;
  title?: string | null;
  price?: number | null;
  status?: "active" | "removed" | "old" | "blocked" | "rejected";
  url?: string | null;
  category?: { id?: number; name?: string };
};

export function normalizeAvitoListing(raw: AvitoRawListing): CanonicalMarketplaceListing {
  return {
    externalId: String(raw.id),
    externalUrl: raw.url ?? null,
    title: raw.title == null ? unavailableMarketplaceValue("not supplied by Avito") : marketplaceValue(raw.title),
    price: raw.price == null ? unavailableMarketplaceValue("not supplied by Avito") : marketplaceValue(raw.price),
    publicationActive: raw.status == null ? unavailableMarketplaceValue("not supplied by Avito") : marketplaceValue(raw.status === "active"),
    platformStatus: raw.status ?? "not_supplied",
  };
}

export function parseAvitoListingReference(reference: string): string {
  const normalized = reference.trim();
  if (/^[1-9]\d{5,19}$/.test(normalized)) return normalized;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error("Введите ID или корректную ссылку на объявление Авито");
  }
  if (url.protocol !== "https:") throw new Error("Ссылка Авито должна использовать HTTPS");
  const hostname = url.hostname.toLowerCase();
  if (hostname !== "avito.ru" && !hostname.endsWith(".avito.ru")) {
    throw new Error("Разрешены только ссылки на Авито");
  }
  const match = url.pathname.match(/(?:_|\/)([1-9]\d{5,19})(?:\/)?$/);
  if (!match?.[1]) throw new Error("Не удалось определить ID объявления Авито");
  return match[1];
}
