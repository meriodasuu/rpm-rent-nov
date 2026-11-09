CREATE SEQUENCE "Booking_bookingNumber_seq";

ALTER TABLE "Booking" ADD COLUMN "bookingNumber" INTEGER;

WITH numbered_bookings AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC)::INTEGER AS "bookingNumber"
  FROM "Booking"
)
UPDATE "Booking"
SET "bookingNumber" = numbered_bookings."bookingNumber"
FROM numbered_bookings
WHERE "Booking"."id" = numbered_bookings."id";

SELECT setval('"Booking_bookingNumber_seq"', COALESCE((SELECT MAX("bookingNumber") FROM "Booking"), 0) + 1, false);

ALTER SEQUENCE "Booking_bookingNumber_seq" OWNED BY "Booking"."bookingNumber";
ALTER TABLE "Booking" ALTER COLUMN "bookingNumber" SET DEFAULT nextval('"Booking_bookingNumber_seq"');
ALTER TABLE "Booking" ALTER COLUMN "bookingNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
