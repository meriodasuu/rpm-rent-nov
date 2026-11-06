import { beforeEach, expect, it, vi } from "vitest";
const models = vi.hoisted(() => ({ booking: { updateMany: vi.fn() }, lead: { updateMany: vi.fn() } }));
vi.mock("@/lib/database-url", () => ({ resolveDatabaseUrl: () => "postgresql://test:test@localhost/test" }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: class {} }));
vi.mock("@/generated/prisma/client", () => ({ PrismaClient: class { booking = models.booking; lead = models.lead; } }));
import { PrismaStore } from "./prisma-store";
beforeEach(() => vi.resetAllMocks());

it.each(["booking", "lead"] as const)("updates only the selected %s comment and supports clearing", async (kind) => {
  models[kind].updateMany.mockResolvedValue({ count: 1 });
  const store = new PrismaStore();
  await store.updateInquiryComment(kind, "inquiry-1", "Заметка");
  expect(models[kind].updateMany).toHaveBeenCalledWith({ where: { id: "inquiry-1" }, data: { managerComment: "Заметка" } });
  await store.updateInquiryComment(kind, "inquiry-1", null);
  expect(models[kind].updateMany).toHaveBeenLastCalledWith({ where: { id: "inquiry-1" }, data: { managerComment: null } });
  expect(models[kind === "booking" ? "lead" : "booking"].updateMany).not.toHaveBeenCalled();
});

it.each(["booking", "lead"] as const)("reports a missing %s", async (kind) => {
  models[kind].updateMany.mockResolvedValue({ count: 0 });
  await expect(new PrismaStore().updateInquiryComment(kind, "missing", "Заметка")).rejects.toThrow("Обращение не найдено");
});
