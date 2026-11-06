export type CarImage = { url: string; alt: string };

export type Car = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  title: string;
  category: string;
  bodyType: string;
  vehicleClass: string;
  year: number | null;
  transmission: string | null;
  engine: string | null;
  horsepower: number | null;
  driveType: string | null;
  seats: number | null;
  shortDescription: string;
  description: string;
  pricePerDay: number;
  oldPrice: number | null;
  deposit: number;
  minimumAge: number | null;
  minimumDrivingExperience: number | null;
  minimumRentalDays: number | null;
  mileageLimit: number | null;
  extraMileagePrice: number | null;
  insurance: string | null;
  features: string[];
  rentalConditions: string[];
  available: boolean;
  published: boolean;
  isNew: boolean;
  isPromotion: boolean;
  isDemo: boolean;
  recommendedOrder: number;
  images: CarImage[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  published: boolean;
  sortOrder: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  sortOrder: number;
};

export type Location = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  address: string | null;
  mapUrl: string | null;
  directions: string | null;
  workingHours: string | null;
  images: string[];
  published: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type BookingStatus = "NEW" | "IN_PROGRESS" | "CONFIRMED" | "DECLINED" | "CANCELLED" | "COMPLETED";
export type LeadStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "DECLINED";
export type OriginDomain = "rpm-rent.ru" | "rpmrent.ru";
export type TelegramOperatorRole = "ADMIN" | "OPERATOR";
export type TelegramOperator = { id: string; telegramUserId: string | null; username: string; role: TelegramOperatorRole; createdAt: string };

export type BookingServiceSnapshot = { id: string; title: string; price: number };

export type Booking = {
  id: string;
  bookingNumber: number;
  carId: string;
  carTitle: string;
  startAt: string;
  endAt: string;
  pickupMethod: "office" | "delivery";
  deliveryAddress: string | null;
  customerName: string;
  phone: string;
  telegram: string | null;
  birthDate: string | null;
  licenseIssuedOn: string | null;
  driverAgeAtStart: number | null;
  drivingExperienceMonths: number | null;
  minimumAgeApplied: number | null;
  minimumDrivingExperienceApplied: number | null;
  minimumRentalDaysApplied: number | null;
  additionalServiceIds: string[];
  additionalServicesSnapshot: BookingServiceSnapshot[];
  comment: string | null;
  managerComment?: string | null;
  rentalDays: number;
  pricePerDaySnapshot: number;
  rentalPrice: number;
  additionalServicesPrice: number;
  deposit: number;
  source: string;
  originDomain: OriginDomain | null;
  utm: Record<string, string>;
  referrer: string | null;
  idempotencyKey: string;
  privacyConsentAt: string | null;
  status: BookingStatus;
  createdAt: string;
};

export type Lead = {
  id: string;
  carId: string;
  carTitle: string;
  startAt: string;
  phone: string;
  managerComment?: string | null;
  source: "yandex_direct" | "vk_ads";
  originDomain: OriginDomain | null;
  utm: Record<string, string>;
  landingPath: string;
  referrer: string | null;
  idempotencyKey: string;
  privacyConsentAt: string;
  status: LeadStatus;
  createdAt: string;
};

export type LeadCreateResult = { lead: Lead; created: boolean };

export type DevDatabase = {
  cars: Car[];
  services: Service[];
  faqs: Faq[];
  locations: Location[];
  bookings: Booking[];
  leads: Lead[];
  telegramOperators: TelegramOperator[];
};
