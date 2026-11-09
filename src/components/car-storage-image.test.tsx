import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarCard } from "./car-card";
import type { Car } from "@/types/domain";

const car: Car = {
  id: "car-porsche-911", slug: "porsche-911-carrera-4s", brand: "Porsche", model: "911", title: "Porsche 911", category: "Спорт", bodyType: "Купе", vehicleClass: "Премиум",
  year: 2024, transmission: null, engine: null, horsepower: null, driveType: null, seats: null, shortDescription: "Описание", description: "Полное описание автомобиля.",
  pricePerDay: 35_000, oldPrice: null, deposit: 0, minimumAge: 18, minimumDrivingExperience: 3, minimumRentalDays: 1, mileageLimit: null, extraMileagePrice: null, insurance: null,
  features: [], rentalConditions: [], available: true, published: true, isNew: false, isPromotion: false, isDemo: false, recommendedOrder: 1,
  images: [{ url: "/api/media/storage?path=cars%2Fcar-porsche-911%2Ffb424ac1-988c-4fd9-8e52-2a2cbc83cca2.jpg", alt: "Porsche 911" }], seoTitle: null, seoDescription: null,
};

describe("CarCard", () => {
  it("renders Storage proxy previews through the Next image optimizer", () => {
    const html = renderToStaticMarkup(<CarCard car={car} />);

    expect(html).toContain("/_next/image?url=%2Fapi%2Fmedia%2Fstorage");
  });
});
