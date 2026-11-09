import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CatalogClient } from "./catalog-client";
import type { Car } from "@/types/domain";

const car = (id: string, vehicleClass: string): Car => ({
  id, slug: id, brand: "Test", model: id, title: id, category: "Устаревшая категория", bodyType: "Купе", vehicleClass,
  year: null, transmission: null, engine: null, horsepower: null, driveType: null, seats: null, shortDescription: "", description: "",
  pricePerDay: 20_000, oldPrice: null, deposit: 0, minimumAge: null, minimumDrivingExperience: null, minimumRentalDays: null,
  mileageLimit: null, extraMileagePrice: null, insurance: null, features: [], rentalConditions: [], available: false, published: true,
  isNew: false, isPromotion: false, isDemo: false, recommendedOrder: 1, images: [], seoTitle: null, seoDescription: null,
});

describe("CatalogClient", () => {
  it("filters the fleet by the three classes without a category control", () => {
    const html = renderToStaticMarkup(<CatalogClient cars={[car("sport", "Спорт"), car("business", "Бизнес"), car("premium", "Премиум")]} />);

    expect(html).not.toContain("Категория");
    expect(html).not.toContain("Устаревшая категория");
    expect(html).toContain("Спорт");
    expect(html).toContain("Бизнес");
    expect(html).toContain("Премиум");
  });
});
