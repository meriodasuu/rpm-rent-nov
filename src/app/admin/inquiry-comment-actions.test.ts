import { beforeEach, expect, it, vi } from "vitest";
import { updateInquiryCommentAction } from "./inquiry-comment-actions";
import { DomainError } from "@/lib/domain/errors";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), update: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.auth }));
vi.mock("@/lib/data", () => ({ getStore: async () => ({ updateInquiryComment: mocks.update }) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
beforeEach(() => vi.resetAllMocks());
const form = (kind = "booking", comment = "  Позвонить завтра\nПосле 12:00  ") => {
  const data = new FormData();
  data.set("kind", kind); data.set("id", "inquiry-1"); data.set("comment", comment);
  return data;
};
const initial = { error: "", saved: false };

it("requires authentication before writing", async () => {
  mocks.auth.mockRejectedValue(new Error("unauthorized"));
  await expect(updateInquiryCommentAction(initial, form())).rejects.toThrow("unauthorized");
  expect(mocks.update).not.toHaveBeenCalled();
});

it.each(["booking", "lead"])("saves a trimmed multiline %s comment and refreshes the queue", async (kind) => {
  expect(await updateInquiryCommentAction(initial, form(kind))).toEqual({ error: "", saved: true });
  expect(mocks.update).toHaveBeenCalledWith(kind, "inquiry-1", "Позвонить завтра\nПосле 12:00");
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin/bookings");
});

it("clears an empty comment", async () => {
  await updateInquiryCommentAction(initial, form("lead", " \n "));
  expect(mocks.update).toHaveBeenCalledWith("lead", "inquiry-1", null);
});

it.each([["other", "text"], ["booking", "a".repeat(1001)], ["lead", "bad\u0000text"]])("rejects invalid input (%s)", async (kind, comment) => {
  expect((await updateInquiryCommentAction(initial, form(kind, comment))).saved).toBe(false);
  expect(mocks.update).not.toHaveBeenCalled();
});

it("reports a missing record without showing success", async () => {
  mocks.update.mockRejectedValue(new DomainError("NOT_FOUND", "Обращение не найдено", 404));
  expect(await updateInquiryCommentAction(initial, form())).toEqual({ error: "Обращение не найдено", saved: false });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
