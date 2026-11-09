UPDATE "Car"
SET "vehicleClass" = CASE
  WHEN slug IN (
    'porsche-911-carrera-4s', 'bmw-m4', 'audi-rs5', 'toyota-supra',
    'bmw-m8-2021', 'bmw-m5-2021', 'dodge-challenger-2019',
    'mercedes-benz-e-63-s-amg-2017', 'mercedes-benz-c-63-amg-2016',
    'mercedes-benz-amg-gt-50-2019', 'mercedes-benz-e-53-amg-2020',
    'mercedes-benz-c-43-amg-2018', 'porsche-taycan-turbo-s-2021',
    'tesla-model-s-black-2017'
  ) THEN 'Спорт'
  WHEN slug IN (
    'lamborghini-urus', 'mercedes-amg-g63', 'bentley-continental',
    'maserati-ghibli-2017', 'mercedes-benz-amg-g-63-2021',
    'mercedes-benz-s-450-l-2018', 'mercedes-benz-s-450-2019',
    'porsche-cayenne-turbo-2019', 'porsche-panamera-4-2019',
    'porsche-cayenne-gts-2017', 'rolls-royce-wraith-2015'
  ) THEN 'Премиум'
  ELSE 'Бизнес'
END;

UPDATE "Car" SET category = "vehicleClass";

ALTER TABLE "Car"
  ADD CONSTRAINT "Car_vehicleClass_supported_check"
  CHECK ("vehicleClass" IN ('Спорт', 'Бизнес', 'Премиум'));

UPDATE "Faq"
SET answer = 'Да. Укажите желаемые даты аренды при оформлении заявки. Менеджер проверит доступность выбранного автомобиля и свяжется с вами для подтверждения.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'faq-dates';
