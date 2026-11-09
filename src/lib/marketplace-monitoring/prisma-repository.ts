import { Prisma } from "@/generated/prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { getPrisma } from "@/lib/data/prisma-store";
import type { MarketplaceMonitoringRepository } from "./monitoring-service";
import { MonitoringAlreadyRunningError } from "./monitoring-service";
import type { PersistedDiscrepancy } from "./discrepancy";

const AVITO_CODE = "AVITO";
const AVITO_NAME = "Avito";
const staleRunMilliseconds = 15 * 60_000;

const marketplace = async () => getPrisma().marketplace.upsert({
  where: { code: AVITO_CODE },
  create: { code: AVITO_CODE, name: AVITO_NAME },
  update: { name: AVITO_NAME },
});

const isUniqueConflict = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export const isMarketplaceDatabaseConfigured = () => Boolean(resolveDatabaseUrl()?.startsWith("postgres"));

export class PrismaMarketplaceMonitoringRepository implements MarketplaceMonitoringRepository {
  async startRun(_marketplaceCode: "AVITO", actorEmail: string) {
    const market = await marketplace();
    const staleBefore = new Date(Date.now() - staleRunMilliseconds);
    await getPrisma().marketplaceSyncRun.updateMany({
      where: { marketplaceId: market.id, status: "RUNNING", startedAt: { lt: staleBefore } },
      data: { status: "FAILED", finishedAt: new Date(), errorCode: "STALE_RUN", errorMessage: "Предыдущая проверка не завершилась" },
    });
    try {
      return await getPrisma().$transaction(async (database) => {
        const run = await database.marketplaceSyncRun.create({
          data: { marketplaceId: market.id, actorEmail, status: "RUNNING" },
        });
        await database.marketplaceAuditLog.create({
          data: { marketplaceId: market.id, actorEmail, action: "REFRESH_STARTED", details: { syncRunId: run.id } },
        });
        return { id: run.id, marketplaceId: market.id };
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new MonitoringAlreadyRunningError();
      throw error;
    }
  }

  async getLinkedCars(_marketplaceCode: "AVITO") {
    void _marketplaceCode;
    const rows = await getPrisma().marketplaceListing.findMany({
      where: { marketplace: { code: AVITO_CODE }, status: "LINKED" },
      select: {
        id: true,
        externalId: true,
        car: { select: { id: true, title: true, pricePerDay: true, published: true, available: true } },
      },
    });
    return rows.map((row) => ({ listingId: row.id, externalId: row.externalId, car: row.car }));
  }

  async getDiscrepancies(listingId: string): Promise<PersistedDiscrepancy[]> {
    const rows = await getPrisma().marketplaceDiscrepancy.findMany({ where: { listingId } });
    return rows.map((row) => ({
      listingId: row.listingId,
      fingerprint: row.fingerprint,
      fieldCode: row.fieldCode,
      masterValue: row.masterValue,
      externalValue: row.externalValue,
      severity: row.severity,
      status: row.status,
      policyVersion: row.policyVersion,
      firstDetectedAt: row.firstDetectedAt,
      lastDetectedAt: row.lastDetectedAt,
      resolvedAt: row.resolvedAt,
    }));
  }

  async saveSuccessfulCheck(input: Parameters<MarketplaceMonitoringRepository["saveSuccessfulCheck"]>[0]) {
    await getPrisma().$transaction(async (database) => {
      await database.marketplaceSnapshot.create({
        data: {
          listingId: input.listingId,
          syncRunId: input.runId,
          normalizedData: input.observation.canonical as Prisma.InputJsonValue,
          rawData: input.observation.rawData as Prisma.InputJsonValue,
          comparisonData: input.comparisons as Prisma.InputJsonValue,
          payloadHash: input.payloadHash,
          createdAt: input.checkedAt,
        },
      });
      for (const item of input.discrepancyChanges.upserts) {
        const existing = await database.marketplaceDiscrepancy.findUnique({ where: { fingerprint: item.fingerprint }, select: { status: true } });
        await database.marketplaceDiscrepancy.upsert({
          where: { fingerprint: item.fingerprint },
          create: {
            listingId: input.listingId,
            syncRunId: input.runId,
            fieldCode: item.fieldCode,
            masterValue: item.masterValue,
            externalValue: item.externalValue,
            severity: item.severity,
            status: "OPEN",
            fingerprint: item.fingerprint,
            policyVersion: item.policyVersion,
            firstDetectedAt: item.firstDetectedAt,
            lastDetectedAt: item.lastDetectedAt,
          },
          update: {
            syncRunId: input.runId,
            severity: item.severity,
            status: existing?.status === "IGNORED" ? "IGNORED" : "OPEN",
            lastDetectedAt: item.lastDetectedAt,
            resolvedAt: null,
          },
        });
      }
      if (input.discrepancyChanges.resolveFingerprints.length) {
        await database.marketplaceDiscrepancy.updateMany({
          where: { listingId: input.listingId, status: "OPEN", fingerprint: { in: input.discrepancyChanges.resolveFingerprints } },
          data: { status: "RESOLVED", resolvedAt: input.checkedAt, syncRunId: input.runId },
        });
      }
      await database.marketplaceListing.update({
        where: { id: input.listingId },
        data: {
          externalUrl: input.observation.canonical.externalUrl,
          lastCheckedAt: input.checkedAt,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      });
    });
  }

  async markListingError(listingId: string, code: string, message: string, checkedAt: Date) {
    await getPrisma().marketplaceListing.update({
      where: { id: listingId },
      data: { lastCheckedAt: checkedAt, lastErrorCode: code, lastErrorMessage: message },
    });
  }

  async markLinkedListingsError(_marketplaceCode: "AVITO", code: string, message: string) {
    void _marketplaceCode;
    await getPrisma().marketplaceListing.updateMany({
      where: { marketplace: { code: AVITO_CODE }, status: "LINKED" },
      data: { lastCheckedAt: new Date(), lastErrorCode: code, lastErrorMessage: message },
    });
  }

  async finishRun(runId: string, result: Parameters<MarketplaceMonitoringRepository["finishRun"]>[1]) {
    const run = await getPrisma().marketplaceSyncRun.update({
      where: { id: runId },
      data: {
        status: result.status,
        finishedAt: new Date(),
        checkedListings: result.checkedListings,
        discrepancyCount: result.discrepancyCount,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
      },
      select: { marketplaceId: true, actorEmail: true },
    });
    await getPrisma().marketplaceAuditLog.create({
      data: {
        marketplaceId: run.marketplaceId,
        actorEmail: run.actorEmail ?? "system",
        action: "REFRESH_FINISHED",
        details: { syncRunId: runId, ...result },
      },
    });
  }

  async linkListing(input: { carId: string; externalId: string; externalUrl: string | null; actorEmail: string }) {
    const market = await marketplace();
    try {
      return await getPrisma().$transaction(async (database) => {
        const car = await database.car.findUnique({ where: { id: input.carId }, select: { id: true } });
        if (!car) throw new Error("Автомобиль не найден");
        const external = await database.marketplaceListing.findUnique({
          where: { marketplaceId_externalId: { marketplaceId: market.id, externalId: input.externalId } },
        });
        if (external && external.status === "LINKED" && external.carId !== input.carId) throw new Error("Объявление уже связано с другим автомобилем");
        await database.marketplaceListing.updateMany({
          where: { carId: input.carId, marketplaceId: market.id, status: "LINKED", ...(external ? { id: { not: external.id } } : {}) },
          data: { status: "UNLINKED" },
        });
        const listing = external
          ? await database.marketplaceListing.update({ where: { id: external.id }, data: { carId: input.carId, status: "LINKED", externalUrl: input.externalUrl, lastErrorCode: null, lastErrorMessage: null } })
          : await database.marketplaceListing.create({ data: { carId: input.carId, marketplaceId: market.id, externalId: input.externalId, externalUrl: input.externalUrl } });
        await database.marketplaceAuditLog.create({
          data: { marketplaceId: market.id, listingId: listing.id, carId: input.carId, actorEmail: input.actorEmail, action: "LISTING_LINKED", details: { externalId: input.externalId } },
        });
        return listing;
      });
    } catch (error) {
      if (isUniqueConflict(error)) throw new Error("Объявление уже связано");
      throw error;
    }
  }

  async unlinkListing(input: { listingId: string; carId: string; actorEmail: string }) {
    const listing = await getPrisma().marketplaceListing.findFirst({
      where: { id: input.listingId, carId: input.carId, marketplace: { code: AVITO_CODE }, status: "LINKED" },
      select: { id: true, marketplaceId: true, externalId: true },
    });
    if (!listing) throw new Error("Связь с объявлением не найдена");
    await getPrisma().$transaction([
      getPrisma().marketplaceListing.update({ where: { id: listing.id }, data: { status: "UNLINKED" } }),
      getPrisma().marketplaceAuditLog.create({
        data: { marketplaceId: listing.marketplaceId, listingId: listing.id, carId: input.carId, actorEmail: input.actorEmail, action: "LISTING_UNLINKED", details: { externalId: listing.externalId } },
      }),
    ]);
  }

  async dashboard() {
    const market = await getPrisma().marketplace.findUnique({ where: { code: AVITO_CODE }, select: { id: true, name: true } });
    if (!market) return { marketplace: null, listings: [], latestRun: null };
    const [listings, latestRun] = await Promise.all([
      getPrisma().marketplaceListing.findMany({
        where: { marketplaceId: market.id, status: "LINKED" },
        include: {
          snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
          discrepancies: { where: { status: "OPEN" }, orderBy: [{ severity: "asc" }, { lastDetectedAt: "desc" }] },
        },
      }),
      getPrisma().marketplaceSyncRun.findFirst({ where: { marketplaceId: market.id }, orderBy: { startedAt: "desc" } }),
    ]);
    return { marketplace: market, listings, latestRun };
  }

  async listingDetail(carId: string) {
    return getPrisma().marketplaceListing.findFirst({
      where: { carId, marketplace: { code: AVITO_CODE }, status: "LINKED" },
      include: {
        snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
        discrepancies: { orderBy: { lastDetectedAt: "desc" }, take: 50 },
      },
    });
  }
}
