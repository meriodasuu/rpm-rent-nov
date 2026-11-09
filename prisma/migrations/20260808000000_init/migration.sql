CREATE SCHEMA IF NOT EXISTS "public";
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CONFIRMED', 'DECLINED', 'COMPLETED');

CREATE TABLE "Car" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "bodyType" TEXT NOT NULL,
  "vehicleClass" TEXT NOT NULL,
  "year" INTEGER,
  "transmission" TEXT,
  "engine" TEXT,
  "horsepower" INTEGER,
  "driveType" TEXT,
  "seats" INTEGER,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "pricePerDay" INTEGER NOT NULL,
  "oldPrice" INTEGER,
  "deposit" INTEGER NOT NULL,
  "minimumAge" INTEGER,
  "minimumDrivingExperience" INTEGER,
  "mileageLimit" INTEGER,
  "extraMileagePrice" INTEGER,
  "insurance" TEXT,
  "features" JSONB NOT NULL,
  "rentalConditions" JSONB NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "isNew" BOOLEAN NOT NULL DEFAULT false,
  "isPromotion" BOOLEAN NOT NULL DEFAULT false,
  "isDemo" BOOLEAN NOT NULL DEFAULT true,
  "recommendedOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CarImage" (
  "id" TEXT NOT NULL,
  "carId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "carId" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "pickupMethod" TEXT NOT NULL,
  "deliveryAddress" TEXT,
  "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "telegram" TEXT,
  "birthDate" TIMESTAMP(3),
  "drivingExperienceMonths" INTEGER NOT NULL,
  "additionalServiceIds" JSONB NOT NULL,
  "comment" TEXT,
  "rentalDays" INTEGER NOT NULL,
  "rentalPrice" INTEGER NOT NULL,
  "additionalServicesPrice" INTEGER NOT NULL,
  "deposit" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "utm" JSONB,
  "referrer" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Faq" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");
CREATE INDEX "CarImage_carId_sortOrder_idx" ON "CarImage"("carId", "sortOrder");
CREATE UNIQUE INDEX "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
