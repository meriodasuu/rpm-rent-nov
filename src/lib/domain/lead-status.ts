import type { LeadStatus } from "@/types/domain";
import { DomainError } from "./errors";

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "Новый", IN_PROGRESS: "В работе", COMPLETED: "Обработан", DECLINED: "Отказ",
};

export function parseLeadStatus(value: unknown): LeadStatus {
  if (typeof value !== "string" || !Object.hasOwn(leadStatusLabels, value)) {
    throw new DomainError("VALIDATION_ERROR", "Некорректный статус лида", 422);
  }
  return value as LeadStatus;
}
