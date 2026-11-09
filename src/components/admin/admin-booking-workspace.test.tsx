import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { Booking, Lead } from "@/types/domain";
import { AdminBookingWorkspace } from "./admin-booking-workspace";
import { filterInquiries, formatInquiryTime } from "@/lib/admin-inquiries";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/app/admin/actions", () => ({ updateBookingStatusAction: vi.fn() }));
vi.mock("@/app/admin/lead-actions", () => ({ updateLeadStatusAction: vi.fn() }));
vi.mock("@/app/admin/inquiry-comment-actions", () => ({ updateInquiryCommentAction: vi.fn() }));

const booking = {
  id: "booking-1", bookingNumber: 1, carId: "car-1", carTitle: "Porsche 911", startAt: "2027-09-10", endAt: "2027-09-12",
  pickupMethod: "office", deliveryAddress: null, customerName: "Иван", phone: "+79991112233", telegram: null,
  birthDate: null, licenseIssuedOn: null, driverAgeAtStart: null, drivingExperienceMonths: null, minimumAgeApplied: 18,
  minimumDrivingExperienceApplied: 12, minimumRentalDaysApplied: 2, additionalServiceIds: [], additionalServicesSnapshot: [],
  comment: null, rentalDays: 2, pricePerDaySnapshot: 10000, rentalPrice: 20000, additionalServicesPrice: 0, deposit: 10000,
  source: "website_booking", originDomain: "rpm-rent.ru", utm: {}, referrer: null, idempotencyKey: "key",
  privacyConsentAt: "2026-09-02T10:00:00.000Z", status: "NEW", createdAt: "2026-09-02T10:00:00.000Z"
} as Booking;

const lead = {
  id: "lead-1", carId: "car-1", carTitle: "Porsche 911", startAt: "2027-09-10", phone: "+79991112233",
  source: "yandex_direct", originDomain: "rpmrent.ru", utm: {}, landingPath: "/cars/porsche-911", referrer: null,
  idempotencyKey: "lead-key", privacyConsentAt: "2026-09-02T10:00:00.000Z", status: "NEW", createdAt: "2026-09-02T10:00:00.000Z"
} as Lead;

describe("AdminBookingWorkspace", () => {
  it.each(["booking", "lead"] as const)("renders the saved manager comment and editable form for %s", (kind) => {
    const html = renderToStaticMarkup(<AdminBookingWorkspace
      bookings={kind === "booking" ? [{ ...booking, comment: "От клиента", managerComment: "От менеджера" }] : []}
      leads={kind === "lead" ? [{ ...lead, managerComment: "От менеджера" }] : []}
      initialFilter="all" now="2026-09-07T12:00:00Z" />);
    expect(html).toContain("Комментарий менеджера");
    expect(html).toContain("От менеджера</textarea>");
    expect(html).toContain("Сохранить комментарий");
    expect(html).toContain(`name="kind" value="${kind}"`);
    if (kind === "booking") expect(html).toContain("От клиента");
  });
  it("merges both kinds newest first and searches formatted phones", () => {
    const newer = { ...lead, createdAt: "2026-09-07T10:00:00Z" };
    const now = new Date("2026-09-07T12:00:00Z");
    expect(filterInquiries([booking], [newer], "all", "all", "", now).map((item) => item.kind)).toEqual(["lead", "booking"]);
    expect(filterInquiries([booking], [newer], "all", "lead", "+7 (999) 111-22-33", now).map((item) => item.id)).toEqual([lead.id]);
    expect(filterInquiries([booking], [newer], "all", "all", "Иван", now).map((item) => item.id)).toEqual([booking.id]);
    expect(filterInquiries([booking], [{ ...newer, status: "COMPLETED" }], "attention", "lead", "", now)).toEqual([]);
    expect(filterInquiries([booking], [newer], "today", "all", "", now).map((item) => item.id)).toEqual([lead.id]);
  });

  it("shows a lead-only queue with its detail and status controls", () => {
    const html = renderToStaticMarkup(<AdminBookingWorkspace bookings={[]} leads={[lead]} initialFilter="all" now="2026-09-07T12:00:00Z" />);
    expect(html).toContain('aria-label="Список заявок"');
    expect(html).toContain('aria-label="Статус лида"');
    expect(html).not.toContain("Обращений пока нет");
    expect(html).not.toContain("Водитель</h3>");
  });

  it("does not retain an excluded customer in the detail panel", () => {
    const html = renderToStaticMarkup(<AdminBookingWorkspace bookings={[booking]} leads={[lead]} initialFilter="CONFIRMED" initialBookingId={booking.id} now="2026-09-07T12:00:00Z" />);
    expect(html).toContain("Нет подходящих обращений");
    expect(html).not.toContain(booking.customerName);
    expect(html).not.toContain('aria-label="Статус лида"');
  });

  it("uses Moscow creation date for today's incoming queue", () => {
    expect(formatInquiryTime("2026-09-06T21:30:00Z")).toContain("00:30");
    const midnightLead = { ...lead, createdAt: "2026-09-06T21:30:00Z" };
    expect(filterInquiries([], [midnightLead], "today", "all", "", new Date("2026-09-07T01:00:00Z"))).toHaveLength(1);
  });
  it("shows the originating domain for full bookings and Direct leads", () => {
    const html = renderToStaticMarkup(<AdminBookingWorkspace
      bookings={[booking]}
      leads={[lead]}
      initialFilter="all"
      now="2026-09-02T12:00:00.000Z"
    />);

    expect(html).toContain("rpm-rent.ru");
    expect(html).toContain("rpmrent.ru");
  });
});
