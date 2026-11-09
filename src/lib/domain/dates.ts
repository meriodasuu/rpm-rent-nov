import { RENTAL_POLICY } from "@/config/rental-policy";
import { validationError } from "./errors";

export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const parseDateOnly = (value: string): Date | null => {
  if (!DATE_ONLY_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
};

export const normalizeStoredDate = (value: string | Date) => {
  if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? todayInBusinessTimeZone(date) : "";
};

export const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export const todayInBusinessTimeZone = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RENTAL_POLICY.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

export const differenceInCalendarDays = (startDate: string, endDate: string) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return 0;
  return Math.trunc((end.getTime() - start.getTime()) / 86_400_000);
};

export const completedYearsAt = (birthDate: string, onDate: string) => {
  const birth = parseDateOnly(birthDate);
  const on = parseDateOnly(onDate);
  if (!birth || !on) return -1;
  let years = on.getUTCFullYear() - birth.getUTCFullYear();
  if (on.getUTCMonth() < birth.getUTCMonth() || (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate())) years--;
  return years;
};

export const completedMonthsAt = (fromDate: string, onDate: string) => {
  const from = parseDateOnly(fromDate);
  const on = parseDateOnly(onDate);
  if (!from || !on) return -1;
  let months = (on.getUTCFullYear() - from.getUTCFullYear()) * 12 + on.getUTCMonth() - from.getUTCMonth();
  if (on.getUTCDate() < from.getUTCDate()) months--;
  return months;
};

export const assertRentalPeriod = ({
  startDate,
  endDate,
  minimumRentalDays = 1,
  now = new Date()
}: {
  startDate: string;
  endDate: string;
  minimumRentalDays?: number;
  now?: Date;
}) => {
  if (!parseDateOnly(startDate)) throw validationError("Укажите корректную дату начала в формате ГГГГ-ММ-ДД", "startAt");
  if (!parseDateOnly(endDate)) throw validationError("Укажите корректную дату окончания в формате ГГГГ-ММ-ДД", "endAt");
  const today = todayInBusinessTimeZone(now);
  if (startDate < today) throw validationError("Нельзя оформить аренду на прошедший период", "startAt");
  const days = differenceInCalendarDays(startDate, endDate);
  if (days <= 0) throw validationError("Дата окончания должна быть позже даты начала", "endAt");
  if (days < minimumRentalDays) throw validationError(`Минимальный срок аренды: ${minimumRentalDays} сут.`, "endAt");
  if (days > RENTAL_POLICY.maximumRentalDays) throw validationError(`Период не может превышать ${RENTAL_POLICY.maximumRentalDays} сут.`, "endAt");
  if (differenceInCalendarDays(today, startDate) > RENTAL_POLICY.maximumAdvanceDays) {
    throw validationError(`Оформление доступно не более чем за ${RENTAL_POLICY.maximumAdvanceDays} дней`, "startAt");
  }
  return days;
};
