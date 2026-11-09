import type { Booking, BookingStatus, Car } from "@/types/domain";

export type AdminBookingFilter = "all" | "attention" | "today" | BookingStatus;

const adminBookingFilters = new Set<AdminBookingFilter>([
  "all",
  "attention",
  "today",
  "NEW",
  "IN_PROGRESS",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
  "COMPLETED",
]);

export type AdminSummary = {
  attention: number;
  pickupsToday: number;
  returnsToday: number;
  occupiedCars: number;
  availableCars: number;
};

export type AdminCalendarDay = {
  key: string;
  day: string;
  weekday: string;
  isToday: boolean;
};

const businessTimeZone = "Europe/Moscow";
const attentionStatuses = new Set<BookingStatus>(["NEW", "IN_PROGRESS"]);
const occupancyStatuses = new Set<BookingStatus>(["NEW", "IN_PROGRESS", "CONFIRMED"]);

const businessDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: businessTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: businessTimeZone,
  weekday: "short"
});

const toBusinessDateKey = (value: Date): string => businessDateFormatter.format(value);
const normalize = (value: string): string => value.toLocaleLowerCase("ru-RU").replace(/\s+/g, " ").trim();

export const parseAdminBookingFilter = (value: unknown): AdminBookingFilter =>
  typeof value === "string" && adminBookingFilters.has(value as AdminBookingFilter)
    ? value as AdminBookingFilter
    : "attention";

export const getSafeAdminReturnTo = (value: unknown): string => {
  if (typeof value !== "string") return "/admin/bookings";
  return /^\/admin\/bookings(?:[?#].*)?$/.test(value) ? value : "/admin/bookings";
};

export const bookingOccupiesDay = (booking: Booking, day: string): boolean => (
  occupancyStatuses.has(booking.status) && booking.startAt.slice(0, 10) <= day && booking.endAt.slice(0, 10) >= day
);

export const getAdminSummary = (bookings: Booking[], cars: Car[], now: Date): AdminSummary => {
  const today = toBusinessDateKey(now);
  const confirmedToday = bookings.filter((item) => item.status === "CONFIRMED");
  const occupied = new Set(confirmedToday.filter((item) => bookingOccupiesDay(item, today)).map((item) => item.carId));
  const readyCars = cars.filter((item) => item.available && item.published);

  return {
    attention: bookings.filter((item) => attentionStatuses.has(item.status)).length,
    pickupsToday: confirmedToday.filter((item) => item.startAt.slice(0, 10) === today).length,
    returnsToday: confirmedToday.filter((item) => item.endAt.slice(0, 10) === today).length,
    occupiedCars: occupied.size,
    availableCars: readyCars.filter((item) => !occupied.has(item.id)).length
  };
};

export const filterAdminBookings = (
  bookings: Booking[],
  filter: AdminBookingFilter,
  search: string,
  now: Date
): Booking[] => {
  const today = toBusinessDateKey(now);
  const query = normalize(search);

  return bookings
    .filter((item) => {
      if (filter === "attention" && !attentionStatuses.has(item.status)) return false;
      if (filter === "today" && !bookingOccupiesDay(item, today)) return false;
      if (!(["all", "attention", "today"] as string[]).includes(filter) && item.status !== filter) return false;
      if (!query) return true;
      return normalize([item.id, item.customerName, item.phone, item.telegram ?? "", item.carTitle].join(" ")).includes(query);
    })
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const buildCalendarDays = (now: Date, count: number): AdminCalendarDay[] => {
  const today = toBusinessDateKey(now);
  const cursor = new Date(`${today}T12:00:00.000Z`);

  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const date = new Date(cursor);
    date.setUTCDate(cursor.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      day: new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: businessTimeZone }).format(date).replace(" г.", ""),
      weekday: weekdayFormatter.format(date).replace(".", ""),
      isToday: key === today
    };
  });
};

export const getBookingAgeLabel = (booking: Booking, now: Date): string => {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(booking.createdAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  return `${Math.floor(hours / 24)} дн`;
};

export const getNextActiveBooking = (bookings: Booking[], carId: string, now: Date): Booking | null => {
  const today = toBusinessDateKey(now);
  return bookings
    .filter((item) => item.carId === carId && occupancyStatuses.has(item.status) && item.endAt.slice(0, 10) >= today)
    .toSorted((left, right) => left.startAt.localeCompare(right.startAt))[0] ?? null;
};

export const isAttentionBooking = (booking: Booking): boolean => attentionStatuses.has(booking.status);
export const isOccupancyBooking = (booking: Booking): boolean => occupancyStatuses.has(booking.status);
