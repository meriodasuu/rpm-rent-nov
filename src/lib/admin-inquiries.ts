
import { trafficSourceLabel } from "@/lib/direct-traffic";
import type { Booking, Lead } from "@/types/domain";
import type { AdminBookingFilter } from "./admin-operations";

export type InquiryKind = "all" | "booking" | "lead";
export type Inquiry = ({ kind: "booking" } & Booking) | ({ kind: "lead" } & Lead);
export const inquiryKey = (item: Inquiry) => `${item.kind}:${item.id}`;
export const formatInquiryTime = (value: string | Date) => new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Moscow" }).format(new Date(value));
const dateKey = (value: string | Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" }).format(new Date(value));

export function filterInquiries(bookings: Booking[], leads: Lead[], filter: AdminBookingFilter, kind: InquiryKind, search: string, now: Date): Inquiry[] {
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const digits = query.replace(/\D/g, "");
  const phoneQuery = /^[+\d\s()–-]+$/.test(query) && digits.length > 0;
  const items: Inquiry[] = [...bookings.map((item) => ({ ...item, kind: "booking" as const })), ...leads.map((item) => ({ ...item, kind: "lead" as const }))];
  return items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (filter === "attention" && !["NEW", "IN_PROGRESS"].includes(item.status)) return false;
    if (filter === "today" && dateKey(item.createdAt) !== dateKey(now)) return false;
    if (!["all", "attention", "today"].includes(filter) && item.status !== filter) return false;
    const text = [item.id, item.kind === "booking" ? item.customerName : trafficSourceLabel(item.source), item.phone, item.carTitle, item.originDomain, item.kind === "booking" ? item.telegram : ""].join(" ").toLocaleLowerCase("ru-RU");
    return !query || text.includes(query) || (phoneQuery && item.phone.replace(/\D/g, "").includes(digits));
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || inquiryKey(a).localeCompare(inquiryKey(b)));
}
