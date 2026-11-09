import { describe, expect, test } from "vitest";
import { normalizeVercelCar, normalizeVercelLocation } from "./vercel-admin-import";

describe("Vercel admin import normalization", () => {
  test("normalizes editable car fields while preserving fields absent from the old form", () => {
    const result = normalizeVercelCar({
      id: "car-1", slug: "porsche-911-carrera-4s", title: "Porsche 911", brand: "Porsche", model: "911",
      category: "sport", bodyType: "coupe", vehicleClass: "premium", shortDescription: "Короткое описание автомобиля",
      description: "Полное описание автомобиля для страницы каталога", pricePerDay: "45000", oldPrice: "",
      deposit: "100000", minimumDrivingExperience: "36", minimumRentalDays: "2", mileageLimit: "200",
      extraMileagePrice: "100", recommendedOrder: "7", year: "2024", horsepower: "450", seats: "4",
      transmission: "АКПП", engine: "3.0", driveType: "полный", insurance: "КАСКО",
      rentalConditions: "Паспорт\nВодительское удостоверение", features: "Климат\nCarPlay",
      images: ["/api/media/storage?path=cars/car-1/one.jpg"], published: "on", available: "on",
      seoTitle: "", seoDescription: "",
    }, { minimumAge: 25, isNew: true, isPromotion: false, isDemo: false });

    expect(result).toMatchObject({
      pricePerDay: 45000, oldPrice: null, minimumAge: 25, published: true, available: true, category: "Спорт", vehicleClass: "Спорт",
      year: 2024, rentalConditions: ["Паспорт", "Водительское удостоверение"], features: ["Климат", "CarPlay"],
      isNew: false, images: [{ url: "/api/media/storage?path=cars/car-1/one.jpg", alt: "Porsche 911" }],
    });
  });

  test("preserves optional location values missing from a streamed admin form", () => {
    const result = normalizeVercelLocation({
      id: "location-1", slug: "centre", title: "Центр", subtitle: "В центре", description: "Подробное описание локации",
      address: "Невский проспект", workingHours: "10:00–20:00", sortOrder: "1", images: ["/image.jpg"],
    }, { mapUrl: "https://yandex.ru/maps/1", directions: "Вход со двора", seoTitle: null, seoDescription: null, published: true });

    expect(result).toMatchObject({ mapUrl: "https://yandex.ru/maps/1", directions: "Вход со двора", published: true });
  });

  test("disables online requests when the old car has an incomplete booking policy", () => {
    const result = normalizeVercelCar({
      id: "car-2", slug: "car-2", title: "Car 2", brand: "Brand", model: "Model", category: "sport",
      bodyType: "coupe", vehicleClass: "premium", shortDescription: "Короткое описание автомобиля",
      description: "Полное описание автомобиля для страницы каталога", pricePerDay: "10000", deposit: "0",
      recommendedOrder: "1", published: "on", available: "on", minimumDrivingExperience: "12", minimumRentalDays: "",
      images: ["/image.jpg"],
    }, { minimumAge: null, isNew: false, isPromotion: false, isDemo: false });

    expect(result.available).toBe(false);
    expect(result.published).toBe(true);
  });
});
