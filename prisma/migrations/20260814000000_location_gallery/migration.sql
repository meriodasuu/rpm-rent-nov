ALTER TABLE "Location"
ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "Location"
SET "images" = jsonb_build_array("image")
WHERE "image" <> '';

UPDATE "Car"
SET
  "deposit" = 0,
  "minimumAge" = 18,
  "minimumDrivingExperience" = 3,
  "minimumRentalDays" = COALESCE("minimumRentalDays", 1);

UPDATE "Faq"
SET "answer" = 'Условия залога определяются индивидуально и подтверждаются менеджером до оформления договора.'
WHERE "id" = 'faq-deposit';

UPDATE "Faq"
SET "answer" = 'Минимальный возраст водителя — 18 лет, минимальный водительский стаж — 3 месяца. Соответствие требованиям проверяется при оформлении заявки.'
WHERE "id" = 'faq-age';
