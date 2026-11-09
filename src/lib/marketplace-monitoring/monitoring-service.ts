import { createHash } from "node:crypto";
import { MarketplaceConnectorError, type MarketplaceConnector, type MarketplaceFieldComparison, type MarketplaceListingObservation } from "@/lib/marketplaces/contracts";
import { buildDiscrepancyChanges, type PersistedDiscrepancy } from "./discrepancy";
import { compareMarketplaceListing } from "./comparison";

export class MonitoringAlreadyRunningError extends Error {
  readonly code = "ALREADY_RUNNING";
  constructor() {
    super("Проверка Avito уже выполняется");
    this.name = "MonitoringAlreadyRunningError";
  }
}

export type LinkedMarketplaceCar = {
  listingId: string;
  externalId: string;
  car: { id: string; title: string; pricePerDay: number; published: boolean; available: boolean };
};

export interface MarketplaceMonitoringRepository {
  startRun(marketplaceCode: "AVITO", actorEmail: string): Promise<{ id: string; marketplaceId: string }>;
  getLinkedCars(marketplaceCode: "AVITO"): Promise<LinkedMarketplaceCar[]>;
  getDiscrepancies(listingId: string): Promise<PersistedDiscrepancy[]>;
  saveSuccessfulCheck(input: {
    runId: string;
    listingId: string;
    observation: MarketplaceListingObservation;
    comparisons: MarketplaceFieldComparison[];
    payloadHash: string;
    discrepancyChanges: ReturnType<typeof import("./discrepancy").buildDiscrepancyChanges>;
    checkedAt: Date;
  }): Promise<void>;
  markListingError(listingId: string, code: string, message: string, checkedAt: Date): Promise<void>;
  markLinkedListingsError(marketplaceCode: "AVITO", code: string, message: string): Promise<void>;
  finishRun(runId: string, result: {
    status: "SUCCESS" | "PARTIAL" | "FAILED";
    checkedListings: number;
    discrepancyCount: number;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void>;
}

export class MarketplaceMonitoringService {
  constructor(
    private readonly repository: MarketplaceMonitoringRepository,
    private readonly connector: MarketplaceConnector,
    private readonly now: () => Date = () => new Date(),
    private readonly log: (event: Record<string, unknown>) => void = (event) => console.info(JSON.stringify(event)),
  ) {}

  async run(actorEmail: string): Promise<{ status: "SUCCESS" | "PARTIAL"; checkedListings: number; discrepancyCount: number }> {
    const startedAt = Date.now();
    const run = await this.repository.startRun("AVITO", actorEmail);
    let checkedListings = 0;
    let discrepancyCount = 0;
    this.log({ syncRunId: run.id, marketplace: "AVITO", operation: "monitor", result: "started" });
    try {
      const [linked, observations] = await Promise.all([
        this.repository.getLinkedCars("AVITO"),
        this.connector.listListings(),
      ]);
      const byExternalId = new Map(observations.map((item) => [item.canonical.externalId, item]));
      let failures = 0;
      for (const linkedCar of linked) {
        const checkedAt = this.now();
        const observed = byExternalId.get(linkedCar.externalId);
        if (!observed) {
          failures++;
          await this.repository.markListingError(linkedCar.listingId, "NOT_FOUND", "Объявление Avito не найдено в аккаунте", checkedAt);
          this.log({ syncRunId: run.id, marketplace: "AVITO", listingId: linkedCar.listingId, operation: "check", result: "NOT_FOUND" });
          continue;
        }
        const comparisons = compareMarketplaceListing(linkedCar.car, observed.canonical);
        const existing = await this.repository.getDiscrepancies(linkedCar.listingId);
        const discrepancyChanges = buildDiscrepancyChanges(linkedCar.listingId, existing, comparisons, checkedAt);
        const mismatches = comparisons.filter((item) => item.status === "MISMATCH").length;
        await this.repository.saveSuccessfulCheck({
          runId: run.id,
          listingId: linkedCar.listingId,
          observation: observed,
          comparisons,
          payloadHash: createHash("sha256").update(JSON.stringify(observed.canonical)).digest("hex"),
          discrepancyChanges,
          checkedAt,
        });
        checkedListings++;
        discrepancyCount += mismatches;
        this.log({ syncRunId: run.id, marketplace: "AVITO", listingId: linkedCar.listingId, operation: "check", duration: Date.now() - startedAt, result: mismatches ? "MISMATCH" : "MATCH" });
      }
      const status = failures ? "PARTIAL" as const : "SUCCESS" as const;
      await this.repository.finishRun(run.id, { status, checkedListings, discrepancyCount, ...(failures ? { errorCode: "PARTIAL_SUCCESS", errorMessage: `${failures} объявлений не удалось проверить` } : {}) });
      this.log({ syncRunId: run.id, marketplace: "AVITO", operation: "monitor", duration: Date.now() - startedAt, result: status });
      return { status, checkedListings, discrepancyCount };
    } catch (error) {
      const operationError = error instanceof MarketplaceConnectorError
        ? error
        : new MarketplaceConnectorError("INTERNAL_ERROR", "Внутренняя ошибка мониторинга");
      if (error instanceof MarketplaceConnectorError) {
        try {
          await this.repository.markLinkedListingsError("AVITO", operationError.code, operationError.message);
        } catch {
          this.log({ syncRunId: run.id, marketplace: "AVITO", operation: "mark-listings-failed", result: "INTERNAL_ERROR" });
        }
      }
      await this.repository.finishRun(run.id, {
        status: "FAILED",
        checkedListings,
        discrepancyCount,
        errorCode: operationError.code,
        errorMessage: operationError.message,
      });
      this.log({ syncRunId: run.id, marketplace: "AVITO", operation: "monitor", duration: Date.now() - startedAt, result: operationError.code });
      throw operationError;
    }
  }
}
