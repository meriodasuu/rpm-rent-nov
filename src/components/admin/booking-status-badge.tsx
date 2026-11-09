import type { BookingStatus } from "@/types/domain";
import { bookingStatusLabels } from "@/lib/domain/booking-status";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}>{bookingStatusLabels[status]}</span>;
}
