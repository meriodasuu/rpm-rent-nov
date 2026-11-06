import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const store = vi.hoisted(() => ({
  getBookings: vi.fn(),
  getLeads: vi.fn(),
  getTelegramOperatorByUserId: vi.fn(),
  activateTelegramOperator: vi.fn(),
  inviteTelegramOperator: vi.fn()
}));
const telegram = vi.hoisted(() => ({
  editTelegramMessage: vi.fn<typeof import("@/lib/telegram").editTelegramMessage>(async () => true),
  sendTelegramMessage: vi.fn<typeof import("@/lib/telegram").sendTelegramMessage>(async () => true)
}));

vi.mock("@/lib/data", () => ({ getStore: async () => store }));
vi.mock("@/lib/telegram", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/telegram")>(), ...telegram }));

const booking = {
  id: "booking-new", carId: "car-1", carTitle: "Porsche 911", startAt: "2026-09-01", endAt: "2026-09-04",
  bookingNumber: 42,
  pickupMethod: "office", deliveryAddress: null, customerName: "Иван", phone: "+79991112233", telegram: null,
  birthDate: null, licenseIssuedOn: null, driverAgeAtStart: null, drivingExperienceMonths: null,
  minimumAgeApplied: null, minimumDrivingExperienceApplied: null, minimumRentalDaysApplied: null,
  additionalServiceIds: [], additionalServicesSnapshot: [], comment: null, rentalDays: 3, pricePerDaySnapshot: 10000,
  rentalPrice: 30000, additionalServicesPrice: 0, deposit: 20000, source: "website_booking", utm: {}, referrer: null,
  idempotencyKey: "key", privacyConsentAt: null, status: "NEW", createdAt: "2026-08-21T10:00:00.000Z"
} as const;

const request = (text: string, userId = 123, secret = "webhook-secret", username = "konstant1n_abramov") => new NextRequest("http://localhost/api/telegram/webhook", {
  method: "POST",
  headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": secret },
  body: JSON.stringify({ message: { chat: { id: -100456 }, from: { id: userId, username }, text } })
});

beforeEach(() => {
  store.getLeads.mockResolvedValue([]);
  process.env.TELEGRAM_WEBHOOK_SECRET = "webhook-secret";
  process.env.TELEGRAM_ALLOWED_USER_IDS = "123";
  process.env.TELEGRAM_BOOTSTRAP_ADMINS = "konstant1n_abramov,wthtwn";
  store.getTelegramOperatorByUserId.mockResolvedValue({ role: "OPERATOR", username: "operator" });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/telegram/webhook", () => {
  const lead = {
    source: "yandex_direct",
    id: "cm123456789012345678901234", carTitle: "BMW M4", phone: "+79998887766",
    startAt: "2026-09-10", createdAt: "2026-09-05T06:00:00.000Z",
    status: "IN_PROGRESS", originDomain: "rpm-rent.ru", landingPath: "/cars/bmw-m4", managerComment: "Перезвонить завтра после 12:00"
  };
  it("includes existing Direct leads in the combined history and search", async () => {
    store.getBookings.mockResolvedValue([booking]);
    store.getLeads.mockResolvedValue([lead]);
    await POST(request("/all"));
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Яндекс.Директ"), expect.anything());
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.any(String), expect.objectContaining({
      replyMarkup: expect.objectContaining({ inline_keyboard: expect.arrayContaining([
        [expect.objectContaining({ callback_data: `leadview:${lead.id}:ALL:all:0` })]
      ]) })
    }));
    telegram.sendTelegramMessage.mockClear();
    await POST(request("/find 9998887766"));
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("BMW M4"), expect.anything());
  });
  it("filters Direct leads by status and opens the card with return navigation", async () => {
    store.getBookings.mockResolvedValue([booking]);
    store.getLeads.mockResolvedValue([lead]);
    await POST(request("/bookings IN_PROGRESS"));
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("BMW M4"), expect.anything());
    expect(telegram.sendTelegramMessage).not.toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #42"), expect.anything());
    await POST(new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ callback_query: {
        id: "cb-lead", from: { id: 123 }, data: `leadview:${lead.id}:IN_PROGRESS:all:0`,
        message: { message_id: 88, chat: { id: -100456 } }
      } })
    }));
    expect(telegram.editTelegramMessage).toHaveBeenCalledWith("-100456", 88, expect.stringContaining("Статус: В работе"), {
      replyMarkup: { inline_keyboard: [[{ text: "← К списку", callback_data: "bookings:IN_PROGRESS:all:0" }]] }
    });
    expect(Buffer.byteLength(`leadview:${lead.id}:IN_PROGRESS:all:0`)).toBeLessThanOrEqual(64);
    expect(telegram.editTelegramMessage).toHaveBeenCalledWith("-100456", 88, expect.stringContaining(`Комментарий менеджера: ${lead.managerComment}`), expect.anything());
  });
  it("keeps ten long comment previews within the Telegram message limit", async () => {
    store.getBookings.mockResolvedValue(Array.from({ length: 10 }, (_, index) => ({
      ...booking, bookingNumber: index + 1, carTitle: "А".repeat(150), comment: "К".repeat(1000), managerComment: "М".repeat(1000),
    })));
    await POST(request("/all"));
    const text = telegram.sendTelegramMessage.mock.calls[0]?.[1];
    expect(text?.length).toBeLessThanOrEqual(4096);
    expect(text).toContain("Заявка #10");
  });
  it("includes new Direct leads in /new", async () => {
    store.getBookings.mockResolvedValue([]);
    store.getLeads.mockResolvedValue([{ ...lead, status: "NEW" }]);
    await POST(request("/new"));
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Яндекс.Директ"), expect.anything());
  });
  it("activates a bootstrap admin by username on /start", async () => {
    store.activateTelegramOperator.mockResolvedValue({ role: "ADMIN", username: "konstant1n_abramov" });

    const response = await POST(request("/start"));

    expect(response.status).toBe(200);
    expect(store.activateTelegramOperator).toHaveBeenCalledWith({ telegramUserId: "123", username: "konstant1n_abramov", bootstrapAdminUsernames: ["konstant1n_abramov", "wthtwn"] });
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Администратор"), expect.objectContaining({
      replyMarkup: expect.objectContaining({ inline_keyboard: expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ callback_data: "menu:all" })]),
        expect.arrayContaining([expect.objectContaining({ callback_data: "menu:search" })])
      ]) })
    }));
  });

  it("lets an activated admin invite an operator by username", async () => {
    store.getTelegramOperatorByUserId.mockResolvedValue({ role: "ADMIN", username: "konstant1n_abramov" });
    store.inviteTelegramOperator.mockResolvedValue({ username: "new_manager" });

    await POST(request("/allow @new_manager"));

    expect(store.inviteTelegramOperator).toHaveBeenCalledWith({ username: "new_manager" });
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("@new_manager"));
  });

  it("rejects a request with an invalid Telegram webhook secret", async () => {
    const response = await POST(request("/new", 123, "wrong-secret"));

    expect(response.status).toBe(401);
    expect(store.getBookings).not.toHaveBeenCalled();
  });

  it("does not disclose data to a Telegram user outside the whitelist", async () => {
    store.getTelegramOperatorByUserId.mockResolvedValue(null);
    const response = await POST(request("/new", 999));

    expect(response.status).toBe(403);
    expect(telegram.sendTelegramMessage).not.toHaveBeenCalled();
  });

  it("returns up to ten new bookings with short details and a details button for /new", async () => {
    store.getBookings.mockResolvedValue([booking, { ...booking, id: "booking-done", status: "CONFIRMED" }]);

    const response = await POST(request("/new"));

    expect(response.status).toBe(200);
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("#42"), {
      replyMarkup: { inline_keyboard: [[{ text: "Подробнее", callback_data: "booking:42" }]] }
    });
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("+79991112233"), expect.anything());
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("не указан"), expect.anything());
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.not.stringContaining("booking-done"));
  });

  it("returns a complete booking card for a short /booking number", async () => {
    store.getBookings.mockResolvedValue([booking]);

    await POST(request("/booking 42"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #42"));
  });

  it("explains when /booking does not exist", async () => {
    store.getBookings.mockResolvedValue([]);

    await POST(request("/booking 999"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", "Заявка не найдена.");
  });

  it("returns a complete booking card when the details button is pressed", async () => {
    store.getBookings.mockResolvedValue([booking]);
    const callbackRequest = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ callback_query: {
        id: "callback-1", data: "booking:42", from: { id: 123, username: "konstant1n_abramov" }, message: { chat: { id: -100456 } }
      } })
    });

    await POST(callbackRequest);

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #42"));
  });

  it("lists historical bookings with a status filter and pagination", async () => {
    store.getBookings.mockResolvedValue([
      { ...booking, id: "booking-confirmed", bookingNumber: 44, customerName: "Пётр", status: "CONFIRMED", createdAt: "2026-08-25T10:00:00.000Z" },
      { ...booking, id: "booking-progress", bookingNumber: 43, customerName: "Мария", status: "IN_PROGRESS", createdAt: "2026-08-24T10:00:00.000Z" },
      booking
    ]);

    await POST(request("/bookings CONFIRMED"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявки · Подтверждена"), expect.objectContaining({
      replyMarkup: expect.objectContaining({ inline_keyboard: expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ callback_data: expect.stringMatching(/^bookings:/) })])
      ]) })
    }));
    expect(telegram.sendTelegramMessage).not.toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #43"), expect.anything());
  });

  it("returns bookings of every status for /all", async () => {
    store.getBookings.mockResolvedValue([
      booking,
      { ...booking, id: "booking-confirmed", bookingNumber: 44, status: "CONFIRMED" }
    ]);

    await POST(request("/all"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringMatching(/Заявка #42[\s\S]*Заявка #44/), expect.objectContaining({
      replyMarkup: expect.objectContaining({ inline_keyboard: expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ callback_data: "bookingview:42:ALL:all:0" })])
      ]) })
    }));
  });

  it("opens the requested page of the journal from an inline button", async () => {
    store.getBookings.mockResolvedValue(Array.from({ length: 11 }, (_, index) => ({
      ...booking, id: `booking-${index}`, bookingNumber: 100 - index, customerName: `Клиент ${index}`
    })));
    const callbackRequest = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ callback_query: {
        id: "callback-history", data: "bookings:ALL:all:1", from: { id: 123, username: "konstant1n_abramov" }, message: { message_id: 77, chat: { id: -100456 } }
      } })
    });

    await POST(callbackRequest);

    expect(telegram.editTelegramMessage).toHaveBeenCalledWith("-100456", 77, expect.stringContaining("Заявка #90"), expect.anything());
    expect(telegram.editTelegramMessage).not.toHaveBeenCalledWith("-100456", 77, expect.stringContaining("Заявка #100"), expect.anything());
    expect(telegram.sendTelegramMessage).not.toHaveBeenCalled();
  });

  it("opens a booking inside the journal and provides a back button", async () => {
    store.getBookings.mockResolvedValue([booking]);
    const callbackRequest = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ callback_query: {
        id: "callback-details", data: "bookingview:42:ALL:all:0", from: { id: 123, username: "konstant1n_abramov" }, message: { message_id: 78, chat: { id: -100456 } }
      } })
    });

    await POST(callbackRequest);

    expect(telegram.editTelegramMessage).toHaveBeenCalledWith("-100456", 78, expect.stringContaining("Заявка #42"), {
      replyMarkup: { inline_keyboard: [[{ text: "← К списку", callback_data: "bookings:ALL:all:0" }]] }
    });
  });

  it("opens search from the menu without requiring a command", async () => {
    const callbackRequest = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ callback_query: {
        id: "callback-search", data: "menu:search", from: { id: 123, username: "konstant1n_abramov" }, message: { message_id: 79, chat: { id: -100456 } }
      } })
    });

    await POST(callbackRequest);

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Введите имя"), {
      replyMarkup: { force_reply: true, selective: true }
    });
  });

  it("searches when the user replies to the search prompt", async () => {
    store.getBookings.mockResolvedValue([
      { ...booking, id: "booking-maria", bookingNumber: 43, customerName: "Мария Смирнова" },
      booking
    ]);
    const searchRequest = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "webhook-secret" },
      body: JSON.stringify({ message: {
        chat: { id: -100456 }, from: { id: 123, username: "konstant1n_abramov" }, text: "Мария",
        reply_to_message: { text: "Введите имя, телефон или номер заявки:" }
      } })
    });

    await POST(searchRequest);

    expect(telegram.sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #43"), expect.objectContaining({
      replyMarkup: expect.objectContaining({ inline_keyboard: expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ callback_data: "bookingview:43:ALL:all:0" })])
      ]) })
    }));
  });

  it("finds bookings by a customer name", async () => {
    store.getBookings.mockResolvedValue([
      { ...booking, id: "booking-maria", bookingNumber: 43, customerName: "Мария Смирнова", phone: "+79990001122" },
      booking
    ]);

    await POST(request("/find Мария"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #43"), expect.anything());
  });

  it("finds bookings by a partial phone number", async () => {
    store.getBookings.mockResolvedValue([
      { ...booking, id: "booking-maria", bookingNumber: 43, customerName: "Мария Смирнова", phone: "+79990001122" },
      booking
    ]);

    await POST(request("/find 1122"));

    expect(telegram.sendTelegramMessage).toHaveBeenCalledWith("-100456", expect.stringContaining("Заявка #43"), expect.anything());
  });
});
