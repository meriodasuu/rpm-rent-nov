import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarCard } from "./car-card";
import type { Car } from "@/types/domain";

const car: Car = {
  id: "car-1", slug: "test-car", brand: "Test", model: "Model", title: "Test car", category: "Спорт", bodyType: "Купе", vehicleClass: "Премиум", year: null, transmission: null, engine: null, horsepower: null, driveType: null, seats: null,
  shortDescription: "", description: "", pricePerDay: 20_000, oldPrice: null, deposit: 30_000, minimumAge: null, minimumDrivingExperience: null, minimumRentalDays: null, mileageLimit: null, extraMileagePrice: null, insurance: null, features: [], rentalConditions: [], available: true, published: true, isNew: false, isPromotion: false, isDemo: false, recommendedOrder: 1, images: [], seoTitle: null, seoDescription: null
};

describe("CarCard", () => {
  it("does not advertise unavailable online booking on a card", () => {
    const html = renderToStaticMarkup(<CarCard car={car} />);
    expect(html).not.toContain("Онлайн-оформление недоступно");
  });

  it("shows the vehicle class and body type without a separate category", () => {
    const html = renderToStaticMarkup(<CarCard car={car} />);

    expect(html).toContain("Премиум · Купе");
    expect(html).not.toContain("Спорт · Купе");
  });
});
