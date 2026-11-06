import type { Car } from "@/types/domain";

/** One origin for canonical links, the sitemap and structured data. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rpmrent.ru").replace(/\/+$/, "");

type CarSeoIdentity = Pick<Car, "slug" | "title" | "year" | "seoTitle">;

function normalizeSeoTitle(title: string): string {
  return title
    .replace(/\s*(?:\||[—–-])\s*RPM Rent\s*$/i, "")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

export function buildCarSeoTitle(car: CarSeoIdentity, cars: CarSeoIdentity[]): string {
  const baseTitle = (car.seoTitle || `${car.title} — аренда авто`)
    .replace(/\s*(?:\||[—–-])\s*RPM Rent\s*$/i, "")
    .trim();
  const normalizedTitle = normalizeSeoTitle(baseTitle);
  const hasDuplicate = cars.some((other) =>
    other.slug !== car.slug && normalizeSeoTitle(other.seoTitle || `${other.title} — аренда авто`) === normalizedTitle
  );

  const titleWithYear = hasDuplicate && car.year
    ? baseTitle.replace(car.title, `${car.title} ${car.year}`)
    : baseTitle;
  const localizedTitle = /санкт-петербург|\bспб\b/i.test(titleWithYear)
    ? titleWithYear
    : `${titleWithYear} в Санкт-Петербурге`;

  return `${localizedTitle} | RPM Rent`;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
