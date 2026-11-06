"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { DomainError } from "@/lib/domain/errors";

const commentSchema = z.object({
  kind: z.enum(["booking", "lead"]),
  id: z.string().trim().min(1).max(100),
  comment: z.string().trim().max(1000).refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)),
});

export async function updateInquiryCommentAction(_previous: { error: string; saved: boolean }, formData: FormData) {
  await requireAdmin();
  const parsed = commentSchema.safeParse({ kind: formData.get("kind"), id: formData.get("id"), comment: formData.get("comment") });
  if (!parsed.success) return { error: "Проверьте комментарий: не более 1000 символов, без управляющих символов.", saved: false };
  try {
    const { kind, id, comment } = parsed.data;
    await (await getStore()).updateInquiryComment(kind, id, comment || null);
    revalidatePath("/admin/bookings");
    return { error: "", saved: true };
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message, saved: false };
    console.error("Inquiry comment update failed", error);
    return { error: "Не удалось сохранить комментарий. Попробуйте ещё раз.", saved: false };
  }
}
