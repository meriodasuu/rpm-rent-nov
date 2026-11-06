
import { trafficSourceLabel } from "@/lib/direct-traffic";
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { answerTelegramCallbackQuery, editTelegramMessage, formatBookingDetails, formatBookingSummary, formatCommentPreviews, sendTelegramMessage } from "@/lib/telegram";
import { bookingStatusLabels } from "@/lib/domain/booking-status";
import type { Booking, BookingStatus } from "@/types/domain";

import type { Inquiry } from "@/lib/admin-inquiries";
import type { DataStore } from "@/lib/data/store";
import { leadStatusLabels } from "@/lib/domain/lead-status";

const getInquiries = async (store: DataStore): Promise<Inquiry[]> => {
  const [bookings, leads] = await Promise.all([store.getBookings(), store.getLeads()]);
  return [
    ...bookings.map((item) => ({ ...item, kind: "booking" as const })),
    ...leads.map((item) => ({ ...item, kind: "lead" as const }))
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};
const summary = (item: Inquiry) => item.kind === "booking" ? formatBookingSummary(item) : [
  `🎯 Лид ${trafficSourceLabel(item.source)}`,
  `Телефон: ${item.phone}`,
  `Автомобиль: ${item.carTitle}`,
  `Дата начала: ${item.startAt}`,
  ...formatCommentPreviews(item)
].join("\n");
const leadDetails = (item: Extract<Inquiry, { kind: "lead" }>) => [
  summary({ ...item, managerComment: null }),
  `Комментарий менеджера: ${item.managerComment || "нет"}`,
  `Домен: ${item.originDomain ?? "не определён"}`,
  `Статус: ${leadStatusLabels[item.status]}`,
  `Посадочная: ${item.landingPath}`
].join("\n");
const itemLabel = (item: Inquiry) => item.kind === "booking"
  ? `#${item.bookingNumber} · ${item.customerName}`
  : `🎯 ${trafficSourceLabel(item.source)} · ${item.phone}`;
// Ten cards plus the heading must fit Telegram's 4096-character limit.
const boundedSummary = (item: Inquiry) => {
  const text = summary(item);
  return text.length > 380 ? `${text.slice(0, 379)}…` : text;
};
const itemCallback = (item: Inquiry, status: string, period: string, page: number) =>
  item.kind === "booking" ? `bookingview:${item.bookingNumber}:${status}:${period}:${page}`
    : `leadview:${item.id}:${status}:${period}:${page}`;

type TelegramUpdate = {
  message?: {
    text?: unknown;
    chat?: { id?: unknown };
    from?: { id?: unknown; username?: unknown };
    reply_to_message?: { text?: unknown };
  };
  callback_query?: {
    id?: unknown;
    data?: unknown;
    from?: { id?: unknown; username?: unknown };
    message?: { message_id?: unknown; chat?: { id?: unknown } };
  };
};

const matchesSecret = (received: string | null, expected: string | undefined) => {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

const helpText = "Команды:\n/new — новые заявки\n/all — все заявки\n/bookings — журнал заявок\n/find <номер, телефон или имя> — поиск заявок\n/booking <номер> — полная карточка заявки, например /booking 123";
const adminHelpText = `${helpText}\n/allow @username — дать сотруднику доступ`;
const usernamePattern = /^@?([a-zA-Z0-9_]{5,32})$/;
const bookingStatuses: readonly BookingStatus[] = ["NEW", "IN_PROGRESS", "CONFIRMED", "DECLINED", "CANCELLED", "COMPLETED"];
const pageSize = 10;
const searchPrompt = "Введите имя, телефон или номер заявки:";
const historyPeriods = ["7", "30", "all"] as const;
type HistoryPeriod = typeof historyPeriods[number];
type HistoryStatus = BookingStatus | "ALL";

const bootstrapAdminUsernames = () => (process.env.TELEGRAM_BOOTSTRAP_ADMINS ?? "")
  .split(",").map((username) => username.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);

const bookingNumberFromCommand = (text: string) => text.match(/^\/booking\s+(\d+)$/)?.[1];
const findBookingByNumber = (bookings: Booking[], number: string) => bookings.find((booking) => booking.bookingNumber === Number(number));
const historyStatusFromValue = (value: string): HistoryStatus | null => value === "ALL" || bookingStatuses.includes(value as BookingStatus) ? value as HistoryStatus : null;
const historyPeriodFromValue = (value: string): HistoryPeriod | null => historyPeriods.includes(value as HistoryPeriod) ? value as HistoryPeriod : null;

const mainMenuReplyMarkup = {
  inline_keyboard: [[
    { text: "Все заявки", callback_data: "menu:all" },
    { text: "Новые", callback_data: "menu:new" },
    { text: "Поиск", callback_data: "menu:search" }
  ]]
};

const historyReplyMarkup = (bookings: Inquiry[], status: HistoryStatus, period: HistoryPeriod, page: number, totalPages: number) => ({
  inline_keyboard: [
    ...bookings.map((booking) => [{
      text: itemLabel(booking).slice(0, 40),
      callback_data: itemCallback(booking, status, period, page)
    }]),
    [{ text: `${status === "ALL" ? "✓ " : ""}Все`, callback_data: `bookings:ALL:${period}:0` }, { text: `${status === "NEW" ? "✓ " : ""}Новые`, callback_data: `bookings:NEW:${period}:0` }, { text: `${status === "IN_PROGRESS" ? "✓ " : ""}В работе`, callback_data: `bookings:IN_PROGRESS:${period}:0` }],
    [{ text: `${status === "CONFIRMED" ? "✓ " : ""}Подтверждённые`, callback_data: `bookings:CONFIRMED:${period}:0` }, { text: `${status === "DECLINED" ? "✓ " : ""}Отклонённые`, callback_data: `bookings:DECLINED:${period}:0` }, { text: `${status === "CANCELLED" ? "✓ " : ""}Отменённые`, callback_data: `bookings:CANCELLED:${period}:0` }],
    [{ text: `${status === "COMPLETED" ? "✓ " : ""}Завершённые`, callback_data: `bookings:COMPLETED:${period}:0` }],
    [{ text: `${period === "7" ? "✓ " : ""}7 дней`, callback_data: `bookings:${status}:7:0` }, { text: `${period === "30" ? "✓ " : ""}30 дней`, callback_data: `bookings:${status}:30:0` }, { text: `${period === "all" ? "✓ " : ""}Всё время`, callback_data: `bookings:${status}:all:0` }],
    ...(totalPages > 1 ? [[
      ...(page > 0 ? [{ text: "← Назад", callback_data: `bookings:${status}:${period}:${page - 1}` }] : []),
      { text: `${page + 1}/${totalPages}`, callback_data: "history:noop" },
      ...(page + 1 < totalPages ? [{ text: "Вперёд →", callback_data: `bookings:${status}:${period}:${page + 1}` }] : [])
    ]] : []),
    [{ text: "🔎 Поиск", callback_data: "menu:search" }, { text: "↻ Обновить", callback_data: `bookings:${status}:${period}:${page}` }]
  ]
});

const historyLabel = (status: HistoryStatus) => status === "ALL" ? "Все" : bookingStatusLabels[status];
const periodLabel = (period: HistoryPeriod) => period === "all" ? "Всё время" : `${period} дней`;

const filterHistoryBookings = (bookings: Inquiry[], status: HistoryStatus, period: HistoryPeriod) => {
  const cutoff = period === "all" ? null : Date.now() - Number(period) * 24 * 60 * 60 * 1000;
  return bookings.filter((booking) => status === "ALL" || booking.status === status)
    .filter((booking) => cutoff === null || new Date(booking.createdAt).getTime() >= cutoff)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
};

const bookingHistoryView = (bookings: Inquiry[], status: HistoryStatus, period: HistoryPeriod, requestedPage = 0) => {
  const filtered = filterHistoryBookings(bookings, status, period);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 0), totalPages - 1);
  const pageBookings = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const heading = `Заявки · ${historyLabel(status)} · ${periodLabel(period)}${filtered.length ? `\nНайдено: ${filtered.length}` : "\nЗаявок не найдено."}`;
  return {
    text: [heading, ...pageBookings.map((booking) => boundedSummary(booking))].join("\n\n"),
    replyMarkup: historyReplyMarkup(pageBookings, status, period, page, totalPages)
  };
};

const sendBookingHistory = async (recipient: string, bookings: Inquiry[], status: HistoryStatus, period: HistoryPeriod, requestedPage = 0, messageId?: number) => {
  const view = bookingHistoryView(bookings, status, period, requestedPage);
  if (messageId !== undefined) {
    await editTelegramMessage(recipient, messageId, view.text, { replyMarkup: view.replyMarkup });
    return;
  }
  await sendTelegramMessage(recipient, view.text, { replyMarkup: view.replyMarkup });
};

const searchBookings = (bookings: Inquiry[], query: string) => {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  const phoneQuery = normalizedQuery.replace(/\D/g, "");
  return bookings.filter((booking) =>
    (booking.kind === "booking" && String(booking.bookingNumber) === normalizedQuery)
    || (phoneQuery.length > 0 && booking.phone.replace(/\D/g, "").includes(phoneQuery))
    || (booking.kind === "booking" ? booking.customerName : trafficSourceLabel(booking.source)).toLocaleLowerCase("ru-RU").includes(normalizedQuery)
  ).slice(0, pageSize);
};

const sendSearchResults = async (recipient: string, bookings: Inquiry[]) => {
  if (!bookings.length) {
    await sendTelegramMessage(recipient, "Заявки не найдены.", { replyMarkup: mainMenuReplyMarkup });
    return;
  }
  await sendTelegramMessage(recipient, [`Найдено заявок: ${bookings.length}`, ...bookings.map((booking) => boundedSummary(booking))].join("\n\n"), {
    replyMarkup: { inline_keyboard: [
      ...bookings.map((booking) => [{ text: itemLabel(booking).slice(0, 40), callback_data: itemCallback(booking, "ALL", "all", 0) }]),
      [{ text: "Все заявки", callback_data: "menu:all" }, { text: "Новый поиск", callback_data: "menu:search" }]
    ] }
  });
};

export async function POST(request: NextRequest) {
  if (!matchesSecret(request.headers.get("x-telegram-bot-api-secret-token"), process.env.TELEGRAM_WEBHOOK_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const callback = update.callback_query;
  const message = update.message;
  const userId = callback?.from?.id ?? message?.from?.id;
  const chatId = callback?.message?.chat?.id ?? message?.chat?.id;
  const text = message?.text;
  const username = callback?.from?.username ?? message?.from?.username;
  if (typeof userId !== "number" || (typeof chatId !== "number" && typeof chatId !== "string")) {
    return NextResponse.json({ ok: true });
  }

  const recipient = String(chatId);
  const store = await getStore();
  if (callback) {
    const callbackId = typeof callback.id === "string" ? callback.id : "";
    const callbackData = typeof callback.data === "string" ? callback.data : "";
    const callbackMessageId = typeof callback.message?.message_id === "number" ? callback.message.message_id : undefined;
    const operator = await store.getTelegramOperatorByUserId(String(userId));
    if (!operator) return NextResponse.json({ ok: false }, { status: 403 });
    await answerTelegramCallbackQuery(callbackId);
    if (callbackData === "menu:search") {
      await sendTelegramMessage(recipient, searchPrompt, { replyMarkup: { force_reply: true, selective: true } });
      return NextResponse.json({ ok: true });
    }
    if (callbackData === "menu:all" || callbackData === "menu:new") {
      await sendBookingHistory(recipient, await getInquiries(store), callbackData === "menu:new" ? "NEW" : "ALL", "all", 0, callbackMessageId);
      return NextResponse.json({ ok: true });
    }
    const historyMatch = callbackData.match(/^bookings:([A-Z_]+|ALL):(7|30|all):(\d+)$/);
    if (historyMatch) {
      const status = historyStatusFromValue(historyMatch[1] ?? "");
      const period = historyPeriodFromValue(historyMatch[2] ?? "");
      if (status && period) await sendBookingHistory(recipient, await getInquiries(store), status, period, Number(historyMatch[3] ?? 0), callbackMessageId);
      return NextResponse.json({ ok: true });
    }
    const leadViewMatch = callbackData.match(/^leadview:([a-zA-Z0-9_-]+):([A-Z_]+|ALL):(7|30|all):(\d+)$/);
    if (leadViewMatch) {
      const status = historyStatusFromValue(leadViewMatch[2] ?? "");
      const period = historyPeriodFromValue(leadViewMatch[3] ?? "");
      const lead = (await store.getLeads()).find((item) => item.id === leadViewMatch[1]);
      if (status && period) {
        const details = lead ? leadDetails({ ...lead, kind: "lead" }) : "Лид не найден.";
        const options = { replyMarkup: { inline_keyboard: [[{ text: "← К списку", callback_data: `bookings:${status}:${period}:${leadViewMatch[4] ?? 0}` }]] } };
        if (callbackMessageId !== undefined) await editTelegramMessage(recipient, callbackMessageId, details, options);
        else await sendTelegramMessage(recipient, details, options);
      }
      return NextResponse.json({ ok: true });
    }
    const bookingViewMatch = callbackData.match(/^bookingview:(\d+):([A-Z_]+|ALL):(7|30|all):(\d+)$/);
    if (bookingViewMatch) {
      const status = historyStatusFromValue(bookingViewMatch[2] ?? "");
      const period = historyPeriodFromValue(bookingViewMatch[3] ?? "");
      const booking = findBookingByNumber(await store.getBookings(), bookingViewMatch[1] ?? "");
      if (status && period && callbackMessageId !== undefined) {
        await editTelegramMessage(recipient, callbackMessageId, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.", {
          replyMarkup: { inline_keyboard: [[{ text: "← К списку", callback_data: `bookings:${status}:${period}:${bookingViewMatch[4] ?? 0}` }]] }
        });
      }
      return NextResponse.json({ ok: true });
    }
    const number = callbackData.match(/^booking:(\d+)$/)?.[1];
    if (!number) return NextResponse.json({ ok: true });
    const booking = findBookingByNumber(await store.getBookings(), number);
    await sendTelegramMessage(recipient, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.");
    return NextResponse.json({ ok: true });
  }
  if (typeof text !== "string") return NextResponse.json({ ok: true });
  const normalized = text.trim();
  if (normalized === "/start") {
    const usernameFromTelegram = typeof username === "string" ? username.match(usernamePattern)?.[1] : undefined;
    const operator = usernameFromTelegram ? await store.activateTelegramOperator({
      telegramUserId: String(userId), username: usernameFromTelegram.toLowerCase(), bootstrapAdminUsernames: bootstrapAdminUsernames()
    }) : null;
    await sendTelegramMessage(recipient, operator
      ? `Доступ активирован. ${operator.role === "ADMIN" ? "Администратор." : "Сотрудник."}\n${operator.role === "ADMIN" ? adminHelpText : helpText}`
      : "Доступ не выдан. Попросите администратора добавить ваш @username через /allow.", operator ? { replyMarkup: mainMenuReplyMarkup } : undefined);
    return NextResponse.json({ ok: true });
  }

  const operator = await store.getTelegramOperatorByUserId(String(userId));
  if (!operator) return NextResponse.json({ ok: false }, { status: 403 });
  if (normalized === "/help") {
    await sendTelegramMessage(recipient, operator.role === "ADMIN" ? adminHelpText : helpText, { replyMarkup: mainMenuReplyMarkup });
    return NextResponse.json({ ok: true });
  }
  if (message?.reply_to_message?.text === searchPrompt && normalized.length > 0) {
    await sendSearchResults(recipient, searchBookings(await getInquiries(store), normalized));
    return NextResponse.json({ ok: true });
  }
  const allowMatch = normalized.match(/^\/allow\s+(@?[a-zA-Z0-9_]{5,32})$/);
  if (allowMatch) {
    if (operator.role !== "ADMIN") return NextResponse.json({ ok: false }, { status: 403 });
    const invitedUsername = (allowMatch[1] ?? "").replace(/^@/, "").toLowerCase();
    await store.inviteTelegramOperator({ username: invitedUsername });
    await sendTelegramMessage(recipient, `@${invitedUsername} добавлен. Пусть пользователь напишет боту /start для активации доступа.`);
    return NextResponse.json({ ok: true });
  }
  if (normalized === "/new") {
    const bookings = (await getInquiries(store)).filter((booking) => booking.status === "NEW").slice(0, 10);
    if (!bookings.length) {
      await sendTelegramMessage(recipient, "Новых заявок нет.");
      return NextResponse.json({ ok: true });
    }
    await sendTelegramMessage(recipient, "Новые заявки:");
    for (const booking of bookings) {
      await sendTelegramMessage(recipient, summary(booking), { replyMarkup: { inline_keyboard: [[{ text: "Подробнее", callback_data: booking.kind === "booking" ? `booking:${booking.bookingNumber}` : itemCallback(booking, "NEW", "all", 0) }]] } });
    }
    return NextResponse.json({ ok: true });
  }

  if (normalized === "/all") {
    await sendBookingHistory(recipient, await getInquiries(store), "ALL", "all");
    return NextResponse.json({ ok: true });
  }

  const historyMatch = normalized.match(/^\/bookings(?:\s+(ALL|NEW|IN_PROGRESS|CONFIRMED|DECLINED|CANCELLED|COMPLETED))?$/);
  if (historyMatch) {
    await sendBookingHistory(recipient, await getInquiries(store), historyStatusFromValue(historyMatch[1] ?? "ALL")!, "all");
    return NextResponse.json({ ok: true });
  }

  const findMatch = normalized.match(/^\/find\s+(.+)$/);
  if (findMatch) {
    const bookings = searchBookings(await getInquiries(store), findMatch[1] ?? "");
    await sendSearchResults(recipient, bookings);
    return NextResponse.json({ ok: true });
  }

  const bookingNumber = bookingNumberFromCommand(normalized);
  if (bookingNumber) {
    const booking = findBookingByNumber(await store.getBookings(), bookingNumber);
    await sendTelegramMessage(recipient, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.");
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(recipient, operator.role === "ADMIN" ? adminHelpText : helpText, { replyMarkup: mainMenuReplyMarkup });
  return NextResponse.json({ ok: true });
}
