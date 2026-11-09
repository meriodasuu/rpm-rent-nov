import { beforeEach, expect, it, vi } from "vitest";
import { updateLeadStatusAction } from "./lead-actions";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), update: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.auth }));
vi.mock("@/lib/data", () => ({ getStore: async () => ({ updateLeadStatus: mocks.update }) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
beforeEach(() => vi.resetAllMocks());
const form = (status: string) => { const data = new FormData(); data.set("id", "lead-1"); data.set("status", status); return data; };
it("requires admin authentication before writes", async () => {
  mocks.auth.mockRejectedValue(new Error("unauthorized"));
  await expect(updateLeadStatusAction({ error: "" }, form("COMPLETED"))).rejects.toThrow("unauthorized");
  expect(mocks.update).not.toHaveBeenCalled();
});
it("rejects arbitrary status values", async () => {
  expect(await updateLeadStatusAction({ error: "" }, form("CONFIRMED"))).toEqual({ error: "Некорректный статус лида" });
  expect(mocks.update).not.toHaveBeenCalled();
});
it("saves status and revalidates the admin queue", async () => {
  expect(await updateLeadStatusAction({ error: "" }, form("COMPLETED"))).toEqual({ error: "" });
  expect(mocks.update).toHaveBeenCalledWith("lead-1", "COMPLETED");
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin", "layout");
});
