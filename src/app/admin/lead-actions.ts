"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { parseLeadStatus } from "@/lib/domain/lead-status";
import { DomainError } from "@/lib/domain/errors";

export async function updateLeadStatusAction(_previous: { error: string }, formData: FormData) {
  await requireAdmin();
  try {
    const status = parseLeadStatus(formData.get("status"));
    const id = String(formData.get("id") ?? "");
    if (!id) throw new DomainError("VALIDATION_ERROR", "Не указан лид", 422);
    await (await getStore()).updateLeadStatus(id, status);
    revalidatePath("/admin", "layout");
    return { error: "" };
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    console.error("Lead status update failed", error);
    return { error: "Не удалось сохранить статус. Попробуйте ещё раз." };
  }
}
