CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "Car" ADD COLUMN "minimumRentalDays" INTEGER;

ALTER TABLE "Booking"
  ADD COLUMN "carTitle" TEXT,
  ADD COLUMN "licenseIssuedOn" DATE,
  ADD COLUMN "driverAgeAtStart" INTEGER,
  ADD COLUMN "minimumAgeApplied" INTEGER,
  ADD COLUMN "minimumExperienceApplied" INTEGER,
  ADD COLUMN "minimumRentalDaysApplied" INTEGER,
  ADD COLUMN "additionalServicesSnapshot" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN "pricePerDaySnapshot" INTEGER,
  ADD COLUMN "privacyConsentAt" TIMESTAMP(3),
  ADD COLUMN "integrityProtected" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Booking" AS booking
SET
  "carTitle" = car."title",
  "pricePerDaySnapshot" = CASE
    WHEN booking."rentalDays" > 0 THEN booking."rentalPrice" / booking."rentalDays"
    ELSE 0
  END
FROM "Car" AS car
WHERE car."id" = booking."carId";

ALTER TABLE "Booking"
  ALTER COLUMN "carTitle" SET NOT NULL,
  ALTER COLUMN "pricePerDaySnapshot" SET NOT NULL,
  ALTER COLUMN "startAt" TYPE DATE USING (("startAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Moscow')::date,
  ALTER COLUMN "endAt" TYPE DATE USING (("endAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Moscow')::date,
  ALTER COLUMN "birthDate" TYPE DATE USING "birthDate"::date;

-- Historical rows predate server eligibility and atomic overlap protection.
-- They remain queryable and continue to block in application checks, but are
-- excluded from the new DB constraint so contradictory legacy rows do not make
-- deployment impossible. Every new row is protected by default.
ALTER TABLE "Booking" ALTER COLUMN "integrityProtected" SET DEFAULT true;

UPDATE "Car"
SET "available" = false
WHERE "published" = true
  AND "available" = true
  AND ("minimumAge" IS NULL OR "minimumDrivingExperience" IS NULL OR "minimumRentalDays" IS NULL);

ALTER TABLE "Car"
  ADD CONSTRAINT "Car_pricePerDay_nonnegative" CHECK ("pricePerDay" >= 0 AND "pricePerDay" <= 5000000),
  ADD CONSTRAINT "Car_oldPrice_nonnegative" CHECK ("oldPrice" IS NULL OR "oldPrice" >= 0),
  ADD CONSTRAINT "Car_deposit_nonnegative" CHECK ("deposit" >= 0),
  ADD CONSTRAINT "Car_minimumAge_valid" CHECK ("minimumAge" IS NULL OR "minimumAge" BETWEEN 18 AND 100),
  ADD CONSTRAINT "Car_minimumExperience_valid" CHECK ("minimumDrivingExperience" IS NULL OR "minimumDrivingExperience" BETWEEN 0 AND 1200),
  ADD CONSTRAINT "Car_minimumRentalDays_valid" CHECK ("minimumRentalDays" IS NULL OR "minimumRentalDays" BETWEEN 1 AND 366),
  ADD CONSTRAINT "Car_bookable_policy_complete" CHECK (
    NOT ("published" AND "available") OR
    ("minimumAge" IS NOT NULL AND "minimumDrivingExperience" IS NOT NULL AND "minimumRentalDays" IS NOT NULL)
  );

ALTER TABLE "Service"
  ADD CONSTRAINT "Service_price_nonnegative" CHECK ("price" IS NULL OR ("price" >= 0 AND "price" <= 100000000));

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_period_valid" CHECK ("endAt" > "startAt"),
  ADD CONSTRAINT "Booking_pickupMethod_valid" CHECK ("pickupMethod" IN ('office', 'delivery')),
  ADD CONSTRAINT "Booking_deliveryAddress_required" CHECK ("pickupMethod" <> 'delivery' OR length(trim(COALESCE("deliveryAddress", ''))) >= 5),
  ADD CONSTRAINT "Booking_rentalDays_valid" CHECK ("rentalDays" BETWEEN 1 AND 366),
  ADD CONSTRAINT "Booking_money_nonnegative" CHECK (
    "pricePerDaySnapshot" >= 0 AND
    "rentalPrice" >= 0 AND
    "additionalServicesPrice" >= 0 AND
    "deposit" >= 0
  ),
  ADD CONSTRAINT "Booking_driver_snapshots_valid" CHECK (
    ("driverAgeAtStart" IS NULL OR "driverAgeAtStart" BETWEEN 18 AND 100) AND
    "drivingExperienceMonths" >= 0 AND
    ("minimumAgeApplied" IS NULL OR "minimumAgeApplied" BETWEEN 18 AND 100) AND
    ("minimumExperienceApplied" IS NULL OR "minimumExperienceApplied" >= 0) AND
    ("minimumRentalDaysApplied" IS NULL OR "minimumRentalDaysApplied" BETWEEN 1 AND 366)
  );

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_no_overlapping_active_periods"
  EXCLUDE USING gist (
    "carId" WITH =,
    daterange("startAt", "endAt", '[)') WITH &&
  )
  WHERE ("integrityProtected" = true AND "status" IN ('NEW', 'IN_PROGRESS', 'CONFIRMED'));

CREATE INDEX "Booking_carId_startAt_endAt_idx" ON "Booking"("carId", "startAt", "endAt");
