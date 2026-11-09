import type { BookingStatus } from "@/types/domain";
import { DomainError } from "./errors";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В обработке",
  CONFIRMED: "Подтверждена",
  DECLINED: "Отклонена",
  CANCELLED: "Отменена",
  COMPLETED: "Завершена"
};

export const allowedBookingTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  NEW: ["IN_PROGRESS", "CONFIRMED", "DECLINED", "CANCELLED"],
  IN_PROGRESS: ["CONFIRMED", "DECLINED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  DECLINED: [],
  CANCELLED: [],
  COMPLETED: []
};

export const assertBookingStatusTransition = (current: BookingStatus, next: BookingStatus) => {
  if (current === next) return;
  if (!allowedBookingTransitions[current].includes(next)) {
    throw new DomainError(
      "INVALID_STATUS_TRANSITION",
      `Переход «${bookingStatusLabels[current]}» → «${bookingStatusLabels[next]}» запрещён`,
      409
    );
  }
};

