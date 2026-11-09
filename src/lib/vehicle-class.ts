export const VEHICLE_CLASSES = ["Спорт", "Бизнес", "Премиум"] as const;

export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

export const isVehicleClass = (value: unknown): value is VehicleClass =>
  typeof value === "string" && VEHICLE_CLASSES.includes(value as VehicleClass);

const SPORT_SLUGS = new Set([
  "porsche-911-carrera-4s",
  "bmw-m4",
  "audi-rs5",
  "toyota-supra",
  "bmw-m8-2021",
  "bmw-m5-2021",
  "dodge-challenger-2019",
  "mercedes-benz-e-63-s-amg-2017",
  "mercedes-benz-c-63-amg-2016",
  "mercedes-benz-amg-gt-50-2019",
  "mercedes-benz-e-53-amg-2020",
  "mercedes-benz-c-43-amg-2018",
  "porsche-taycan-turbo-s-2021",
  "tesla-model-s-black-2017",
]);

const PREMIUM_SLUGS = new Set([
  "lamborghini-urus",
  "mercedes-amg-g63",
  "bentley-continental",
  "maserati-ghibli-2017",
  "mercedes-benz-amg-g-63-2021",
  "mercedes-benz-s-450-l-2018",
  "mercedes-benz-s-450-2019",
  "porsche-cayenne-turbo-2019",
  "porsche-panamera-4-2019",
  "porsche-cayenne-gts-2017",
  "rolls-royce-wraith-2015",
]);

export const vehicleClassForCar = (slug: string): VehicleClass => {
  if (SPORT_SLUGS.has(slug)) return "Спорт";
  if (PREMIUM_SLUGS.has(slug)) return "Премиум";
  return "Бизнес";
};
