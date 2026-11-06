import type { Booking, TelegramOperator } from "@/types/domain";

type TelegramReplyMarkup =
  | { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> }
  | { force_reply: true; selective?: boolean };
type TelegramMessageOptions = { replyMarkup?: TelegramReplyMarkup };

const TELEGRAM_REQUEST_TIMEOUT_MS = 5_000;

export const telegramBotApiUrl = (token: string, method: string, relayUrl?: string) => {
  const path = `bot${token}/${method}`;
  return relayUrl?.trim()
    ? `${relayUrl.trim()}?path=${encodeURIComponent(path)}`
    : `https://api.telegram.org/${path}`;
};

const botApiUrl = (method: string) => telegramBotApiUrl(
  process.env.TELEGRAM_BOT_TOKEN ?? "",
  method,
  process.env.TELEGRAM_API_RELAY_URL
);
const money = (amount: number) => new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
const pickupMethod = (booking: Booking) => booking.pickupMethod === "delivery" ? "Доставка" : "Офис";

export const formatBookingDetails = (booking: Booking, heading = "Новая заявка") => {
  const services = booking.additionalServicesSnapshot.length
    ? booking.additionalServicesSnapshot.map((service) => `${service.title} (${money(service.price)})`).join(", ")
    : "Нет";
  return [
    `🆕 ${heading}`,
    `Заявка #${booking.bookingNumber}`,
    `Автомобиль: ${booking.carTitle}`,
    `Даты: ${booking.startAt} — ${booking.endAt} (${booking.rentalDays} дн.)`,
    `Получение: ${pickupMethod(booking)}${booking.deliveryAddress ? `, ${booking.deliveryAddress}` : ""}`,
    `Клиент: ${booking.customerName}`,
    `Телефон: ${booking.phone}`,
    `Telegram: ${booking.telegram ?? "не указан"}`,
    `Услуги: ${services}`,
    `Стоимость: ${money(booking.rentalPrice + booking.additionalServicesPrice)}, залог ${money(booking.deposit)}`,
    `Комментарий: ${booking.comment ?? "нет"}`,
    `Комментарий менеджера: ${booking.managerComment || "нет"}`,
    `Домен: ${booking.originDomain ?? "не определён"}`,
    `Статус: ${booking.status}`,
    `Команда: /booking ${booking.bookingNumber}`
  ].join("\n");
};

export const formatBookingSummary = (booking: Booking) => [
  `Заявка #${booking.bookingNumber}`,
  `Телефон: ${booking.phone}`,
  `Telegram: ${booking.telegram ?? "не указан"}`,
  `Автомобиль: ${booking.carTitle}`,
  `Аренда: ${booking.startAt} — ${booking.endAt} · ${booking.rentalDays} дн.`,
  ...formatCommentPreviews(booking)
].join("\n");

export const formatCommentPreviews = (inquiry: { comment?: string | null; managerComment?: string | null }) => {
  const preview = (text: string) => {
    const normalized = text.replace(/\s+/g, " ").trim();
    return normalized.length > 60 ? `${normalized.slice(0, 59)}…` : normalized;
  };
  return [
    ...(inquiry.comment ? [`Комментарий: ${preview(inquiry.comment)}`] : []),
    ...(inquiry.managerComment ? [`Менеджер: ${preview(inquiry.managerComment)}`] : []),
  ];
};

export const bookingDetailsReplyMarkup = (booking: Booking): TelegramReplyMarkup => ({
  inline_keyboard: [[{ text: "Подробнее", callback_data: `booking:${booking.bookingNumber}` }]]
});

export const sendTelegramMessage = async (chatId: string, text: string, options: TelegramMessageOptions = {}): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return false;
  try {
    const response = await fetch(botApiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(TELEGRAM_REQUEST_TIMEOUT_MS),
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true, ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}) })
    });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch { return false; }
};

export const editTelegramMessage = async (chatId: string, messageId: number, text: string, options: TelegramMessageOptions = {}): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId || !Number.isInteger(messageId)) return false;
  try {
    const response = await fetch(botApiUrl("editMessageText"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, disable_web_page_preview: true, ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}) })
    });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch { return false; }
};

export const answerTelegramCallbackQuery = async (callbackQueryId: string): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !callbackQueryId) return false;
  try {
    const response = await fetch(botApiUrl("answerCallbackQuery"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: callbackQueryId }) });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch { return false; }
};

export const notifyBookingCreated = async (booking: Booking, operators: TelegramOperator[]) => {
  const recipients = [...new Set(operators.flatMap((operator) => operator.telegramUserId ? [operator.telegramUserId] : []))];
  if (!recipients.length) return false;
  const results = await Promise.all(recipients.map((recipient) => sendTelegramMessage(recipient, formatBookingDetails(booking))));
  return results.every(Boolean);
};
