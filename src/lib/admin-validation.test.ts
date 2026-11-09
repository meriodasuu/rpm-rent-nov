import { describe, expect, it } from "vitest";
import { carAdminSchema, faqAdminSchema, serviceAdminSchema } from "./validation";

const car = {
  id: "car-1", slug: "test-car", brand: "Test", model: "One", title: "Test One", bodyType: "Sedan", vehicleClass: "Премиум",
  pricePerDay: 10_000, deposit: 20_000, shortDescription: "Подтверждённое краткое описание", description: "Подтверждённое полное описание автомобиля",
  available: false, published: false, isNew: false, isPromotion: false, isDemo: false,
  year: "", horsepower: "", seats: "", oldPrice: "", minimumAge: "", minimumDrivingExperience: "", minimumRentalDays: "", mileageLimit: "", extraMileagePrice: "",
  recommendedOrder: 1, transmission: "", engine: "", driveType: "", insurance: "", seoTitle: "", seoDescription: ""
};

describe("admin validation", () => {
  it("allows an incomplete draft but not a bookable car with unknown policy", () => {
    expect(carAdminSchema.safeParse(car).success).toBe(true);
    expect(carAdminSchema.safeParse({ ...car, published: true, available: true }).success).toBe(false);
  });

  it("allows explicitly configured zero experience", () => {
    expect(carAdminSchema.safeParse({ ...car, published: true, available: true, minimumAge: 18, minimumDrivingExperience: 0, minimumRentalDays: 1 }).success).toBe(true);
  });

  it("accepts line breaks in a car's full description", () => {
    expect(carAdminSchema.safeParse({ ...car, description: "Первый абзац полного описания.\n\nВторой абзац полного описания." }).success).toBe(true);
  });

  it("accepts only sport, business or premium as a vehicle class", () => {
    expect(carAdminSchema.safeParse({ ...car, vehicleClass: "Спорт" }).success).toBe(true);
    expect(carAdminSchema.safeParse({ ...car, vehicleClass: "Бизнес" }).success).toBe(true);
    expect(carAdminSchema.safeParse({ ...car, vehicleClass: "Люкс" }).success).toBe(false);
    expect(carAdminSchema.safeParse({ ...car, vehicleClass: "Не указан" }).success).toBe(false);
  });

  it("rejects negative, fractional and nonnumeric admin money", () => {
    expect(carAdminSchema.safeParse({ ...car, pricePerDay: -1 }).success).toBe(false);
    expect(carAdminSchema.safeParse({ ...car, deposit: 1.5 }).success).toBe(false);
    expect(carAdminSchema.safeParse({ ...car, pricePerDay: "not-a-number" }).success).toBe(false);
    expect(serviceAdminSchema.safeParse({ id: "s", slug: "service", title: "Услуга", description: "Описание", price: -1, published: true, sortOrder: 1 }).success).toBe(false);
  });

  it("rejects script-like content in managed text", () => {
    expect(faqAdminSchema.safeParse({ id: "f", question: "Что такое аренда?", answer: "<script>alert(1)</script>", category: "general", published: true, sortOrder: 1 }).success).toBe(false);
  });
});
