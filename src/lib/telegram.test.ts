import { afterEach, describe, expect, it, vi } from "vitest";

import { editTelegramMessage, formatBookingDetails, formatBookingSummary, notifyBookingCreated, sendTelegramMessage, telegramBotApiUrl } from "@/lib/telegram";
import type { Booking, TelegramOperator } from "@/types/domain";

const booking = {
  id: "booking-42", carId: "car-1", carTitle: "Porsche 911", startAt: "2026-09-01", endAt: "2026-09-04",
  bookingNumber: 42,
  pickupMethod: "delivery", deliveryAddress: "Санкт-Петербург, Невский 1", customerName: "Иван", phone: "+79991112233",
  telegram: "@ivan", birthDate: null, licenseIssuedOn: null, driverAgeAtStart: null, drivingExperienceMonths: null,
  minimumAgeApplied: null, minimumDrivingExperienceApplied: null, minimumRentalDaysApplied: null,
  additionalServiceIds: [], additionalServicesSnapshot: [], comment: null,
  rentalDays: 3, pricePerDaySnapshot: 10000, rentalPrice: 30000, additionalServicesPrice: 0, deposit: 20000,
  source: "website_booking", utm: {}, referrer: null, idempotencyKey: "key", privacyConsentAt: "2026-08-21T10:00:00.000Z",
  originDomain: "rpm-rent.ru",
  status: "NEW", createdAt: "2026-08-21T10:00:00.000Z"
} as Booking;

const operator = (telegramUserId: string | null, username: string): TelegramOperator => ({
  id: `operator-${username}`, telegramUserId, username, role: "OPERATOR", createdAt: "2026-08-21T10:00:00.000Z"
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_API_RELAY_URL;
});

describe("telegramBotApiUrl", () => {
  it("uses Telegram directly by default", () => {
    expect(telegramBotApiUrl("123:abc", "getMe")).toBe("https://api.telegram.org/bot123:abc/getMe");
  });

  it("routes requests through the configured relay", () => {
    expect(telegramBotApiUrl("123:abc", "sendMessage", "https://relay.example/api/telegram")).toBe(
      "https://relay.example/api/telegram?path=bot123%3Aabc%2FsendMessage"
    );
  });
});

describe("editTelegramMessage", () => {
  it("edits the existing Telegram message with inline controls", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(editTelegramMessage("-100456", 77, "Updated", {
      replyMarkup: { inline_keyboard: [[{ text: "Back", callback_data: "bookings:ALL:all:0" }]] }
    })).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith("https://api.telegram.org/bot123:abc/editMessageText", expect.objectContaining({
      body: JSON.stringify({
        chat_id: "-100456", message_id: 77, text: "Updated", disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "bookings:ALL:all:0" }]] }
      })
    }));
  });
});

describe("booking notifications", () => {
  it("shows client and manager comments separately, shortening only list previews", () => {
    const withComments = { ...booking, comment: "Доставка в аэропорт", managerComment: "Позвонить завтра\n" + "я".repeat(100) };
    const details = formatBookingDetails(withComments);
    expect(details).toContain(`Комментарий: ${withComments.comment}`);
    expect(details).toContain(`Комментарий менеджера: ${withComments.managerComment}`);
    const summary = formatBookingSummary(withComments);
    expect(summary).toContain("Комментарий: Доставка в аэропорт");
    expect(summary).toContain("Менеджер: Позвонить завтра ");
    expect(summary).toContain("…");
    expect(formatBookingDetails(booking)).toContain("Комментарий менеджера: нет");
  });
  it("alerts every activated operator and skips pending invitations", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(notifyBookingCreated(booking, [
      operator("101", "first"), operator(null, "pending"), operator("202", "second")
    ])).resolves.toBe(true);

    const recipients = fetchMock.mock.calls.map(([, request]) => {
      const payload = JSON.parse(String(request?.body)) as { chat_id: string; text: string };
      expect(payload.text).toContain("Заявка #42");
      expect(payload.text).toContain("Клиент: Иван");
      expect(payload.text).toContain("Домен: rpm-rent.ru");
      return payload.chat_id;
    });
    expect(recipients).toEqual(["101", "202"]);
  });

  it("sets a timeout signal for Telegram API requests", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendTelegramMessage("101", "Новая заявка");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123:abc/sendMessage",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
