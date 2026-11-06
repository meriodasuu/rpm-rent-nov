CREATE TYPE "MarketplaceSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');
CREATE TYPE "MarketplaceDiscrepancyStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');
CREATE TYPE "MarketplaceSeverity" AS ENUM ('CRITICAL', 'ERROR', 'WARNING', 'INFO');

CREATE TABLE "Marketplace" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceListing" (
  "id" TEXT NOT NULL,
  "carId" TEXT NOT NULL,
  "marketplaceId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "externalUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'LINKED',
  "lastCheckedAt" TIMESTAMP(3),
  "lastErrorCode" TEXT,
  "lastErrorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceSyncRun" (
  "id" TEXT NOT NULL,
  "marketplaceId" TEXT NOT NULL,
  "status" "MarketplaceSyncStatus" NOT NULL DEFAULT 'RUNNING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "checkedListings" INTEGER NOT NULL DEFAULT 0,
  "discrepancyCount" INTEGER NOT NULL DEFAULT 0,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "actorEmail" TEXT,
  CONSTRAINT "MarketplaceSyncRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceSnapshot" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "syncRunId" TEXT NOT NULL,
  "normalizedData" JSONB NOT NULL,
  "rawData" JSONB NOT NULL,
  "comparisonData" JSONB NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceDiscrepancy" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "syncRunId" TEXT NOT NULL,
  "fieldCode" TEXT NOT NULL,
  "masterValue" TEXT NOT NULL,
  "externalValue" TEXT NOT NULL,
  "severity" "MarketplaceSeverity" NOT NULL,
  "status" "MarketplaceDiscrepancyStatus" NOT NULL DEFAULT 'OPEN',
  "fingerprint" TEXT NOT NULL,
  "policyVersion" INTEGER NOT NULL DEFAULT 1,
  "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceDiscrepancy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceAuditLog" (
  "id" TEXT NOT NULL,
  "marketplaceId" TEXT NOT NULL,
  "listingId" TEXT,
  "carId" TEXT,
  "actorEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Marketplace_code_key" ON "Marketplace"("code");
CREATE UNIQUE INDEX "MarketplaceListing_marketplaceId_externalId_key" ON "MarketplaceListing"("marketplaceId", "externalId");
CREATE UNIQUE INDEX "MarketplaceListing_linked_car_marketplace_key" ON "MarketplaceListing"("carId", "marketplaceId") WHERE "status" = 'LINKED';
CREATE INDEX "MarketplaceListing_carId_marketplaceId_status_idx" ON "MarketplaceListing"("carId", "marketplaceId", "status");
CREATE UNIQUE INDEX "MarketplaceSyncRun_running_marketplace_key" ON "MarketplaceSyncRun"("marketplaceId") WHERE "status" = 'RUNNING';
CREATE INDEX "MarketplaceSyncRun_marketplaceId_startedAt_idx" ON "MarketplaceSyncRun"("marketplaceId", "startedAt");
CREATE INDEX "MarketplaceSnapshot_listingId_createdAt_idx" ON "MarketplaceSnapshot"("listingId", "createdAt");
CREATE INDEX "MarketplaceSnapshot_syncRunId_idx" ON "MarketplaceSnapshot"("syncRunId");
CREATE UNIQUE INDEX "MarketplaceDiscrepancy_fingerprint_key" ON "MarketplaceDiscrepancy"("fingerprint");
CREATE INDEX "MarketplaceDiscrepancy_listingId_status_severity_idx" ON "MarketplaceDiscrepancy"("listingId", "status", "severity");
CREATE INDEX "MarketplaceDiscrepancy_syncRunId_idx" ON "MarketplaceDiscrepancy"("syncRunId");
CREATE INDEX "MarketplaceAuditLog_marketplaceId_createdAt_idx" ON "MarketplaceAuditLog"("marketplaceId", "createdAt");
CREATE INDEX "MarketplaceAuditLog_listingId_createdAt_idx" ON "MarketplaceAuditLog"("listingId", "createdAt");
CREATE INDEX "MarketplaceAuditLog_carId_createdAt_idx" ON "MarketplaceAuditLog"("carId", "createdAt");

ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceSyncRun" ADD CONSTRAINT "MarketplaceSyncRun_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceSnapshot" ADD CONSTRAINT "MarketplaceSnapshot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceSnapshot" ADD CONSTRAINT "MarketplaceSnapshot_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "MarketplaceSyncRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceDiscrepancy" ADD CONSTRAINT "MarketplaceDiscrepancy_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceDiscrepancy" ADD CONSTRAINT "MarketplaceDiscrepancy_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "MarketplaceSyncRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceAuditLog" ADD CONSTRAINT "MarketplaceAuditLog_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketplaceAuditLog" ADD CONSTRAINT "MarketplaceAuditLog_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceAuditLog" ADD CONSTRAINT "MarketplaceAuditLog_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Marketplace" ("id", "code", "name", "createdAt", "updatedAt")
VALUES ('marketplace-avito', 'AVITO', 'Avito', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
