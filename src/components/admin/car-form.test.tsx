import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarForm } from "./car-form";
import type { Car } from "@/types/domain";

const car: Car = {
  id: "car-1", slug: "test-car", brand: "Test", model: "Model", title: "Test car", category: "Спорт", bodyType: "Купе", vehicleClass: "Премиум",
  year: null, transmission: null, engine: null, horsepower: null, driveType: null, seats: null, shortDescription: "Описание автомобиля", description: "Полное описание автомобиля для формы.",
  pricePerDay: 20_000, oldPrice: null, deposit: 0, minimumAge: 18, minimumDrivingExperience: 3, minimumRentalDays: 1, mileageLimit: null, extraMileagePrice: null, insurance: null,
  features: [], rentalConditions: [], available: true, published: true, isNew: false, isPromotion: false, isDemo: false, recommendedOrder: 1, images: [], seoTitle: null, seoDescription: null,
};

describe("CarForm", () => {
  it("does not expose minimum age as an editable admin field", () => {
    const html = renderToStaticMarkup(<CarForm car={car} />);

    expect(html).not.toContain('name="minimumAge"');
    expect(html).not.toContain("Минимальный возраст");
  });

  it("offers only the three supported vehicle classes and no category field", () => {
    const html = renderToStaticMarkup(<CarForm car={car} />);

    expect(html).not.toContain('name="category"');
    expect(html).not.toContain(">Категория<");
    expect(html).toContain('<option value="Спорт">Спорт</option>');
    expect(html).toContain('<option value="Бизнес">Бизнес</option>');
    expect(html).toContain('<option value="Премиум" selected="">Премиум</option>');
  });
});
