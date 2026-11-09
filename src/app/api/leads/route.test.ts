import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const store = vi.hoisted(() => ({
  createLead: vi.fn(async () => ({ lead: { id: "lead-1" }, created: true })),
  getTelegramOperators: vi.fn(async () => [])
}));
const notification = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/lib/data", () => ({ getStore: async () => store }));
vi.mock("@/lib/lead-notification", () => ({ notifyLeadCreated: notification }));

const payload = {
  carId: "tesla-model-3", startAt: "2027-09-01", phone: "+7 999 123-45-67", privacyConsent: true,
  utm: { utm_source: "yandex", yclid: "123" }, landingPath: "/cars/tesla-model-3", referrer: "",
  idempotencyKey: "6dba29c0-6d76-4c44-94e8-4b3ebcbb6eb3"
};

describe("POST /api/leads", () => {
  it("accepts a VK enquiry through the existing endpoint", async () => {
    const input = { ...payload, utm: { utm_source: "vk", rb_clickid: "vk-123" } };
    const response = await POST(new NextRequest("https://rpmrent.ru/api/leads", { method: "POST", body: JSON.stringify(input) }));
    expect(response.status).toBe(201);
    expect(store.createLead).toHaveBeenCalledWith(input, "rpmrent.ru");
  });
  it("persists a minimal Direct lead without invoking booking creation", async () => {
    const response = await POST(new NextRequest("https://rpmrent.ru/api/leads", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "lead-1" });
    expect(store.createLead).toHaveBeenCalledWith(payload, "rpmrent.ru");
    expect(notification).toHaveBeenCalledWith({ id: "lead-1" }, []);
  });

  it("keeps the saved lead successful when the operator lookup fails", async () => {
    store.getTelegramOperators.mockRejectedValueOnce(new Error("database"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await POST(new NextRequest("https://rpmrent.ru/api/leads", { method: "POST", body: JSON.stringify(payload) }));
      expect(response.status).toBe(201);
      expect(log).toHaveBeenCalledWith("lead.telegram-notification.failed", "lead-1", "Error");
    } finally { log.mockRestore(); }
  });

  it("does not send again for an existing lead", async () => {
    notification.mockClear();
    store.createLead.mockResolvedValueOnce({ lead: { id: "lead-1" }, created: false });
    const response = await POST(new NextRequest("https://rpmrent.ru/api/leads", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(200);
    expect(notification).not.toHaveBeenCalled();
  });

  it("rejects a request without a phone number", async () => {
    const response = await POST(new NextRequest("http://localhost/api/leads", { method: "POST", body: JSON.stringify({ ...payload, phone: "" }) }));
    expect(response.status).toBe(422);
  });
});
