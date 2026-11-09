CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "carId" TEXT NOT NULL,
  "carTitle" TEXT NOT NULL,
  "startAt" DATE NOT NULL,
  "phone" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'yandex_direct',
  "utm" JSONB NOT NULL DEFAULT '{}',
  "landingPath" TEXT NOT NULL,
  "referrer" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "privacyConsentAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_idempotencyKey_key" ON "Lead"("idempotencyKey");
CREATE INDEX "Lead_carId_createdAt_idx" ON "Lead"("carId", "createdAt");
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
