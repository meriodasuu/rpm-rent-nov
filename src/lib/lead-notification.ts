
import { trafficSourceLabel } from "@/lib/direct-traffic";
import type { Lead, TelegramOperator } from "@/types/domain";
import { sendTelegramMessage } from "@/lib/telegram";

export const notifyLeadCreated = async (lead: Lead, operators: TelegramOperator[]): Promise<boolean> => {
  const recipients = [...new Set(operators.flatMap((operator) => operator.telegramUserId ? [operator.telegramUserId] : []))];
  if (!recipients.length) return false;

  const text = [
    `🎯 Новый лид ${trafficSourceLabel(lead.source)}`,
    `Автомобиль: ${lead.carTitle}`,
    `Дата начала: ${lead.startAt}`,
    `Телефон: ${lead.phone}`,
    `Домен: ${lead.originDomain ?? "не определён"}`,
    `Посадочная: ${lead.landingPath}`,
    `Источник: ${lead.utm.utm_source || (lead.utm.rb_clickid ? "rb_clickid" : "yclid")}`
  ].join("\n");

  const results = await Promise.all(recipients.map((recipient) => sendTelegramMessage(recipient, text)));
  return results.every(Boolean);
};
