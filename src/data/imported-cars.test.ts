import { describe, expect, it } from "vitest";
import { importedCars } from "./imported-cars";

describe("Avito workbook fleet import", () => {
  it("adds the 36 unique missing automobiles without duplicating the existing fleet", () => {
    expect(importedCars).toHaveLength(36);
    expect(new Set(importedCars.map((car) => car.slug)).size).toBe(importedCars.length);
    expect(importedCars.some((car) => car.slug === "bmw-m4")).toBe(false);
    expect(importedCars.some((car) => car.slug === "audi-rs5")).toBe(false);
  });

  it("imports the green workbook characteristics into supported card fields", () => {
    const bmwM8 = importedCars.find((car) => car.slug === "bmw-m8-2021");
    expect(bmwM8).toMatchObject({
      brand: "BMW",
      model: "M8",
      year: 2021,
      pricePerDay: 35_000,
      horsepower: 625,
      engine: "4.4 xDrive Steptronic (625 л.с.)",
    });
    expect(bmwM8?.features).toContain("Поколение: F91/F92 (2019—2022)");
    expect(bmwM8?.features).toContain("Комплектация: Competition");
    expect(bmwM8?.rentalConditions).toContain("Тариф на 12 часов уточняется у менеджера");
  });

  it("references Yandex Disk through the site proxy and uses a placeholder only when the disk has no folder", () => {
    const withoutImages = importedCars.filter((car) => car.images.length === 0);
    expect(withoutImages.map((car) => car.slug)).toEqual(["bmw-x7-2019"]);

    for (const car of importedCars) {
      for (const image of car.images) {
        expect(image.url.startsWith("/api/media/yandex?path=")).toBe(true);
        expect(decodeURIComponent(image.url)).toMatch(/\/(ИИ NEW|ИИnew|ИИ)\//i);
      }
    }
  });

  it("does not expose import or workbook implementation details in public car copy", () => {
    const publicCopy = importedCars.flatMap((car) => [
      car.shortDescription,
      car.description,
      car.seoDescription ?? "",
      ...car.features,
      ...car.rentalConditions,
    ]).join("\n");

    expect(publicCopy).not.toMatch(/импортирован|рабочего стандарта|зелён|таблиц(?:ы|е)/i);
  });
});
