import { beforeEach, expect, it, vi } from "vitest";
const lead = vi.hoisted(() => ({ findMany: vi.fn(), updateMany: vi.fn() }));
vi.mock("@/lib/database-url", () => ({ resolveDatabaseUrl: () => "postgresql://test:test@localhost/test" }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: class {} }));
vi.mock("@/generated/prisma/client", () => ({ PrismaClient: class { lead = lead; } }));
import { PrismaStore } from "./prisma-store";
beforeEach(() => vi.resetAllMocks());

it("returns the saved PostgreSQL lead status rather than resetting it to NEW", async () => {
  lead.findMany.mockResolvedValue([{
    id: "lead-1", carId: "car-1", carTitle: "Porsche", startAt: new Date("2027-01-10"), phone: "+79991112233",
    originDomain: "rpmrent.ru", utm: {}, landingPath: "/cars/porsche", referrer: null, idempotencyKey: "lead-key",
    privacyConsentAt: new Date("2026-09-07"), createdAt: new Date("2026-09-07"), status: "COMPLETED",
  }]);
  expect(await new PrismaStore().getLeads()).toEqual([expect.objectContaining({ status: "COMPLETED" })]);
});

it("updates only the selected lead and reports missing records", async () => {
  lead.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
  const store = new PrismaStore();
  await store.updateLeadStatus("lead-1", "IN_PROGRESS");
  expect(lead.updateMany).toHaveBeenCalledWith({ where: { id: "lead-1" }, data: { status: "IN_PROGRESS" } });
  await expect(store.updateLeadStatus("missing", "DECLINED")).rejects.toThrow("Лид не найден");
});


it("preserves the stored VK source when mapping PostgreSQL records", async () => {
  lead.findMany.mockResolvedValue([{
    id: "vk-1", source: "vk_ads", carId: "car-1", carTitle: "Porsche", startAt: new Date("2027-01-10"), phone: "+79991112233",
    originDomain: "rpmrent.ru", utm: { utm_source: "vk" }, landingPath: "/cars/porsche", referrer: null, idempotencyKey: "vk-key",
    privacyConsentAt: new Date("2026-09-07"), createdAt: new Date("2026-09-07"), status: "NEW", managerComment: null,
  }]);
  expect(await new PrismaStore().getLeads()).toEqual([expect.objectContaining({ source: "vk_ads" })]);
});
