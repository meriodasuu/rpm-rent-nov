export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";

export const formatDeposit = (value: number) => value > 0 ? formatPrice(value) : "Индивидуально";

export const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export const formatRentalDate = (value: string | Date) =>
  new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value));

export const phoneHref = (value: string) => `tel:${value.replace(/[^+\d]/g, "")}`;
