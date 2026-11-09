import type { Booking, BookingStatus } from "@/types/domain";
import { normalizeStoredDate } from "@/lib/domain/dates";

export const blockingBookingStatuses: BookingStatus[] = ["NEW", "IN_PROGRESS", "CONFIRMED"];

export const periodsOverlap = (startDate: string, endDate: string, otherStartDate: string, otherEndDate: string) =>
  startDate < otherEndDate && endDate > otherStartDate;

export const hasBookingConflict = (bookings: Booking[], carId: string, startDate: string, endDate: string) =>
  bookings.some(
    (item) =>
      item.carId === carId &&
      blockingBookingStatuses.includes(item.status) &&
      periodsOverlap(startDate, endDate, normalizeStoredDate(item.startAt), normalizeStoredDate(item.endAt))
  );

