import { describe, expect, it } from "vitest";
import { marketplaceValue, MarketplaceConnectorError, type MarketplaceConnector, type MarketplaceListingObservation } from "@/lib/marketplaces/contracts";
import { MarketplaceMonitoringService, MonitoringAlreadyRunningError, type MarketplaceMonitoringRepository } from "./monitoring-service";

const observation = (externalId = "123456", price = 25_000): MarketplaceListingObservation => ({
  canonical: {
    externalId,
    externalUrl: `https://www.avito.ru/item_${externalId}`,
    title: marketplaceValue("BMW M4"),
    price: marketplaceValue(price),
    publicationActive: marketplaceValue(true),
    platformStatus: "active",
  },
  rawData: { id: Number(externalId), title: "BMW M4", price, status: "active", url: `https://www.avito.ru/item_${externalId}` },
});

class FakeRepository implements MarketplaceMonitoringRepository {
  running = false;
  finish: Array<{ status: string; checkedListings: number; discrepancyCount: number; errorCode?: string }> = [];
  successfulChecks: Array<{ listingId: string; mismatches: number }> = [];
  listingErrors: Array<{ listingId: string; code: string }> = [];
  globalErrors: Array<{ code: string; message: string }> = [];
  linked = [{
    listingId: "listing-1",
    externalId: "123456",
    car: { id: "car-1", title: "BMW M4", pricePerDay: 25_000, published: true, available: true },
  }];

  async startRun() {
    if (this.running) throw new MonitoringAlreadyRunningError();
    this.running = true;
    return { id: "run-1", marketplaceId: "marketplace-avito" };
  }
  async getLinkedCars() { return this.linked; }
  async getDiscrepancies() { return []; }
  async saveSuccessfulCheck(input: Parameters<MarketplaceMonitoringRepository["saveSuccessfulCheck"]>[0]) {
    this.successfulChecks.push({ listingId: input.listingId, mismatches: input.comparisons.filter((item) => item.status === "MISMATCH").length });
  }
  async markListingError(listingId: string, code: string) { this.listingErrors.push({ listingId, code }); }
  async markLinkedListingsError(_marketplaceCode: "AVITO", code: string, message: string) { this.globalErrors.push({ code, message }); }
  async finishRun(_runId: string, result: Parameters<MarketplaceMonitoringRepository["finishRun"]>[1]) {
    this.finish.push(result);
    this.running = false;
  }
}

const connector = (list: () => Promise<MarketplaceListingObservation[]>): MarketplaceConnector => ({
  healthCheck: async () => ({ status: "AVAILABLE" }),
  listListings: list,
  getListing: async (externalId) => {
    const item = (await list()).find((candidate) => candidate.canonical.externalId === externalId);
    if (!item) throw new MarketplaceConnectorError("NOT_FOUND", "not found");
    return item;
  },
});

describe("MarketplaceMonitoringService", () => {
  it("persists a successful normalized check and discrepancy count", async () => {
    const repository = new FakeRepository();
    const service = new MarketplaceMonitoringService(repository, connector(async () => [observation("123456", 27_000)]));
    await expect(service.run("admin@example.com")).resolves.toMatchObject({ status: "SUCCESS", checkedListings: 1, discrepancyCount: 1 });
    expect(repository.successfulChecks).toEqual([{ listingId: "listing-1", mismatches: 1 }]);
    expect(repository.finish[0]).toMatchObject({ status: "SUCCESS", checkedListings: 1, discrepancyCount: 1 });
  });

  it("returns PARTIAL when one linked listing is absent from a successful Avito response", async () => {
    const repository = new FakeRepository();
    const service = new MarketplaceMonitoringService(repository, connector(async () => []));
    await expect(service.run("admin@example.com")).resolves.toMatchObject({ status: "PARTIAL", checkedListings: 0 });
    expect(repository.listingErrors).toEqual([{ listingId: "listing-1", code: "NOT_FOUND" }]);
  });

  it("records a typed failed run when the connector is not configured", async () => {
    const repository = new FakeRepository();
    const service = new MarketplaceMonitoringService(repository, connector(async () => { throw new MarketplaceConnectorError("NOT_CONFIGURED", "Avito connector не настроен"); }));
    await expect(service.run("admin@example.com")).rejects.toMatchObject({ code: "NOT_CONFIGURED" });
    expect(repository.finish[0]).toMatchObject({ status: "FAILED", errorCode: "NOT_CONFIGURED" });
    expect(repository.globalErrors).toEqual([{ code: "NOT_CONFIGURED", message: "Avito connector не настроен" }]);
  });

  it("keeps actual counters and reports INTERNAL_ERROR after a later persistence failure", async () => {
    const repository = new FakeRepository();
    repository.linked.push({
      listingId: "listing-2",
      externalId: "123457",
      car: { id: "car-2", title: "BMW M4", pricePerDay: 25_000, published: true, available: true },
    });
    const originalSave = repository.saveSuccessfulCheck.bind(repository);
    repository.saveSuccessfulCheck = async (input) => {
      if (input.listingId === "listing-2") throw new Error("database unavailable");
      await originalSave(input);
    };
    const service = new MarketplaceMonitoringService(repository, connector(async () => [observation("123456"), observation("123457")]));
    await expect(service.run("admin@example.com")).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
    expect(repository.finish[0]).toMatchObject({ status: "FAILED", checkedListings: 1, discrepancyCount: 0, errorCode: "INTERNAL_ERROR" });
  });

  it("prevents a concurrent refresh before a second Avito scan starts", async () => {
    const repository = new FakeRepository();
    let release!: (items: MarketplaceListingObservation[]) => void;
    const firstList = new Promise<MarketplaceListingObservation[]>((resolve) => { release = resolve; });
    let scans = 0;
    const service = new MarketplaceMonitoringService(repository, connector(async () => { scans++; return firstList; }));
    const first = service.run("admin@example.com");
    await expect(service.run("admin@example.com")).rejects.toBeInstanceOf(MonitoringAlreadyRunningError);
    expect(scans).toBe(1);
    release([observation()]);
    await first;
  });
});
