export type MarketplaceDashboardStatus = "OK" | "WARNING" | "ERROR" | "CRITICAL" | "NOT LINKED" | "CHECK FAILED";

type DashboardCar = { id: string; title: string; pricePerDay: number; published: boolean };
type DashboardListing = {
  id: string;
  carId: string;
  externalId: string;
  externalUrl: string | null;
  lastCheckedAt: Date | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  snapshots: { createdAt: Date }[];
  discrepancies: { severity: "CRITICAL" | "ERROR" | "WARNING" | "INFO" }[];
};

const statusForListing = (listing: DashboardListing): { status: MarketplaceDashboardStatus; detail: string } => {
  if (listing.lastErrorCode) return { status: "CHECK FAILED", detail: listing.lastErrorMessage ?? listing.lastErrorCode };
  if (!listing.snapshots.length) return { status: "WARNING", detail: "Объявление ещё не проверялось" };
  if (listing.discrepancies.some((item) => item.severity === "CRITICAL")) return { status: "CRITICAL", detail: "Есть критические расхождения" };
  if (listing.discrepancies.some((item) => item.severity === "ERROR")) return { status: "ERROR", detail: "Есть существенные расхождения" };
  if (listing.discrepancies.length) return { status: "WARNING", detail: "Есть расхождения" };
  return { status: "OK", detail: "Данные совпадают" };
};

export function buildMarketplaceDashboardRows(cars: DashboardCar[], listings: DashboardListing[]) {
  const byCar = new Map(listings.map((listing) => [listing.carId, listing]));
  return cars.map((car) => {
    const listing = byCar.get(car.id);
    if (!listing) return {
      ...car,
      carId: car.id,
      listingId: null,
      externalId: null,
      externalUrl: null,
      lastCheckedAt: null,
      mismatchCount: 0,
      status: "NOT LINKED" as const,
      statusDetail: "Объявление Avito не привязано",
    };
    const result = statusForListing(listing);
    return {
      ...car,
      carId: car.id,
      listingId: listing.id,
      externalId: listing.externalId,
      externalUrl: listing.externalUrl,
      lastCheckedAt: listing.lastCheckedAt,
      mismatchCount: listing.discrepancies.length,
      status: result.status,
      statusDetail: result.detail,
    };
  });
}
