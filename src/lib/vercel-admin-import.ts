import type { Car, Location } from "@/types/domain";
import { isVehicleClass, vehicleClassForCar } from "@/lib/vehicle-class";

type RawRecord = Record<string, unknown>;

const stringValue = (value: unknown) => typeof value === "string" ? value : "";
const nullableString = (value: unknown) => {
  const normalized = stringValue(value).trim();
  return normalized && normalized !== "$undefined" ? normalized : null;
};
const integer = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
};
const nullableInteger = (value: unknown) => {
  if (value === "" || value === null || value === undefined || value === "$undefined") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};
const checked = (value: unknown) => value === true || value === "on" || value === "true";
const lines = (value: unknown) => stringValue(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const strings = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
  : (typeof value === "string" && value ? [value] : []);

export const normalizeVercelCar = (
  raw: RawRecord,
  current?: Pick<Car, "minimumAge" | "isNew" | "isPromotion" | "isDemo"> | null,
): Car => {
  const title = stringValue(raw.title);
  const slug = stringValue(raw.slug);
  const vehicleClass = isVehicleClass(raw.vehicleClass) ? raw.vehicleClass : vehicleClassForCar(slug);
  const minimumAge = current?.minimumAge ?? null;
  const minimumDrivingExperience = nullableInteger(raw.minimumDrivingExperience);
  const minimumRentalDays = nullableInteger(raw.minimumRentalDays);
  const policyComplete = minimumAge !== null && minimumDrivingExperience !== null && minimumRentalDays !== null;
  return {
    id: stringValue(raw.id),
    slug,
    brand: stringValue(raw.brand),
    model: stringValue(raw.model),
    title,
    category: vehicleClass,
    bodyType: stringValue(raw.bodyType),
    vehicleClass,
    year: nullableInteger(raw.year),
    transmission: nullableString(raw.transmission),
    engine: nullableString(raw.engine),
    horsepower: nullableInteger(raw.horsepower),
    driveType: nullableString(raw.driveType),
    seats: nullableInteger(raw.seats),
    shortDescription: stringValue(raw.shortDescription),
    description: stringValue(raw.description),
    pricePerDay: integer(raw.pricePerDay),
    oldPrice: nullableInteger(raw.oldPrice),
    deposit: integer(raw.deposit),
    minimumAge,
    minimumDrivingExperience,
    minimumRentalDays,
    mileageLimit: nullableInteger(raw.mileageLimit),
    extraMileagePrice: nullableInteger(raw.extraMileagePrice),
    insurance: nullableString(raw.insurance),
    features: lines(raw.features),
    rentalConditions: lines(raw.rentalConditions),
    available: checked(raw.available) && policyComplete,
    published: checked(raw.published),
    isNew: checked(raw.isNew),
    isPromotion: checked(raw.isPromotion),
    isDemo: checked(raw.isDemo),
    recommendedOrder: integer(raw.recommendedOrder),
    images: strings(raw.images).map((url) => ({ url, alt: title })),
    seoTitle: nullableString(raw.seoTitle),
    seoDescription: nullableString(raw.seoDescription),
  };
};

export const normalizeVercelLocation = (
  raw: RawRecord,
  current?: Pick<Location, "mapUrl" | "directions" | "seoTitle" | "seoDescription" | "published"> | null,
): Location => ({
  id: stringValue(raw.id),
  slug: stringValue(raw.slug),
  title: stringValue(raw.title),
  subtitle: stringValue(raw.subtitle),
  description: stringValue(raw.description),
  address: nullableString(raw.address),
  mapUrl: raw.mapUrl === undefined ? (current?.mapUrl ?? null) : nullableString(raw.mapUrl),
  directions: raw.directions === undefined ? (current?.directions ?? null) : nullableString(raw.directions),
  workingHours: nullableString(raw.workingHours),
  images: strings(raw.images),
  published: raw.published === undefined ? (current?.published ?? false) : checked(raw.published),
  sortOrder: integer(raw.sortOrder),
  seoTitle: raw.seoTitle === undefined ? (current?.seoTitle ?? null) : nullableString(raw.seoTitle),
  seoDescription: raw.seoDescription === undefined ? (current?.seoDescription ?? null) : nullableString(raw.seoDescription),
});
