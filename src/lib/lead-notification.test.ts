import { afterEach, describe, expect, it, vi } from "vitest";

import { notifyLeadCreated } from "@/lib/lead-notification";
import type { Lead, TelegramOperator } from "@/types/domain";

const operator = (telegramUserId: string | null): TelegramOperator => ({
  id: String(telegramUserId), telegramUserId, username: "manager", role: "OPERATOR", createdAt: "2026-09-01"
});

const lead = {
  id: "lead-1", carId: "car-1", carTitle: "Porsche 911", startAt: "2027-09-01", phone: "+79991112233",
  source: "yandex_direct", originDomain: "rpmrent.ru", utm: { utm_source: "yandex" }, landingPath: "/cars/porsche-911",
  referrer: null, idempotencyKey: "key", privacyConsentAt: "2026-09-02T10:00:00.000Z", status: "NEW",
  createdAt: "2026-09-02T10:00:00.000Z"
} as Lead;

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ALERT_CHAT_ID;
});

describe("Direct lead notifications", () => {
  it("includes the originating domain", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await notifyLeadCreated(lead, [operator("101"), operator("102"), operator("101"), operator(null)])).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)).chat_id)).toEqual(["101", "102"]);

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { text: string };
    expect(body.text).toContain("Домен: rpmrent.ru");
    expect(body.text).toContain("Яндекс.Директ");
  });

  it("labels VK leads with their actual advertising source", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    await notifyLeadCreated({ ...lead, source: "vk_ads", utm: { utm_source: "vk" } }, [operator("101")]);
    const text = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).text;
    expect(text).toContain("Новый лид VK Реклама");
    expect(text).not.toContain("Яндекс.Директ");
  });

  it("does not send without active recipients", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await notifyLeadCreated(lead, [operator(null)])).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a failed delivery without stopping delivery to other managers", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    expect(await notifyLeadCreated(lead, [operator("101"), operator("102")])).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
