import { describe, expect, it } from "vitest";
import { seedCars, seedFaqs } from "./seed";
import { VEHICLE_CLASSES } from "@/lib/vehicle-class";

describe("seed content", () => {
  it("uses only the three supported vehicle classes", () => {
    expect(new Set(seedCars.map((car) => car.vehicleClass))).toEqual(new Set(VEHICLE_CLASSES));
    expect(seedCars.find((car) => car.slug === "audi-rs5")?.vehicleClass).toBe("Спорт");
    expect(seedCars.find((car) => car.slug === "mercedes-amg-g63")?.vehicleClass).toBe("Премиум");
    expect(seedCars.find((car) => car.slug === "bentley-continental")?.vehicleClass).toBe("Премиум");
  });

  it("describes date selection without claiming automated availability checks", () => {
    const faq = seedFaqs.find((item) => item.id === "faq-dates");

    expect(faq?.answer).toBe("Да. Укажите желаемые даты аренды при оформлении заявки. Менеджер проверит доступность выбранного автомобиля и свяжется с вами для подтверждения.");
  });
});
