ALTER TABLE "Booking" ADD COLUMN "originDomain" TEXT;
ALTER TABLE "Lead" ADD COLUMN "originDomain" TEXT;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_originDomain_check"
  CHECK ("originDomain" IS NULL OR "originDomain" IN ('rpm-rent.ru', 'rpmrent.ru'));

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_originDomain_check"
  CHECK ("originDomain" IS NULL OR "originDomain" IN ('rpm-rent.ru', 'rpmrent.ru'));
