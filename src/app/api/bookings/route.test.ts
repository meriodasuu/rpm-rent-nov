import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const store = vi.hoisted(() => ({
  createBooking: vi.fn(async () => ({ id: "booking-1" })),
  getTelegramOperators: vi.fn(async () => [
    { id: "operator-1", telegramUserId: "101", username: "manager", role: "OPERATOR", createdAt: "2026-08-21T10:00:00.000Z" }
  ]),
}));
const telegram = vi.hoisted(() => ({ notifyBookingCreated: vi.fn(async () => false) }));

vi.mock("@/lib/data", () => ({ getStore: async () => store }));
vi.mock("@/lib/telegram", () => telegram);

beforeEach(() => {
  vi.clearAllMocks();
});

const request = (body: string, ip: string, headers: Record<string, string> = {}, origin = "http://localhost") => new NextRequest(`${origin}/api/bookings`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
  body
});

describe("POST /api/bookings boundary", () => {
  it("accepts a booking request without birth or driving licence dates", async () => {
    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [], comment: "", privacyConsent: true,
      utm: {}, referrer: "", idempotencyKey: crypto.randomUUID()
    }), "192.0.2.4"));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "booking-1" });
  });

  it("attributes the booking to rpm-rent.ru from the request URL", async () => {
    const body = {
      carId: "car-porsche-911", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [], comment: "", privacyConsent: true,
      utm: {}, referrer: "", idempotencyKey: crypto.randomUUID()
    };

    await POST(request(JSON.stringify(body), "192.0.2.7", {}, "https://rpm-rent.ru"));

    expect(store.createBooking).toHaveBeenCalledWith(body, "rpm-rent.ru");
  });

  it("notifies Telegram after saving a booking without affecting the response", async () => {
    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-02-10", endAt: "2027-02-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [], comment: "", privacyConsent: true,
      utm: {}, referrer: "", idempotencyKey: crypto.randomUUID()
    }), "192.0.2.5"));

    expect(response.status).toBe(201);
    expect(telegram.notifyBookingCreated).toHaveBeenCalledWith(
      { id: "booking-1" },
      [{ id: "operator-1", telegramUserId: "101", username: "manager", role: "OPERATOR", createdAt: "2026-08-21T10:00:00.000Z" }]
    );
  });

  it("keeps the booking response successful when operator lookup fails", async () => {
    store.getTelegramOperators.mockRejectedValueOnce(new Error("database unavailable"));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-03-10", endAt: "2027-03-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [], comment: "", privacyConsent: true,
      utm: {}, referrer: "", idempotencyKey: crypto.randomUUID()
    }), "192.0.2.6"));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "booking-1" });
    expect(errorLog).toHaveBeenCalledWith("booking.telegram-notification.failed", "Error");
    errorLog.mockRestore();
  });

  it("rejects malformed JSON without leaking an internal error", async () => {
    const response = await POST(request("{", "192.0.2.1"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Некорректный формат данных" });
  });

  it("rejects an oversized request from the header before parsing", async () => {
    const response = await POST(request("{}", "192.0.2.2", { "content-length": "40000" }));
    expect(response.status).toBe(413);
  });

  it("rejects mass assignment at the public API boundary", async () => {
    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "",
      additionalServiceIds: [], comment: "", privacyConsent: true, utm: {}, referrer: "", idempotencyKey: crypto.randomUUID(), status: "CONFIRMED"
    }), "192.0.2.3"));
    expect(response.status).toBe(422);
  });
});

