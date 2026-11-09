import { describe, expect, it } from "vitest";
import { VEHICLE_CLASSES, vehicleClassForCar } from "./vehicle-class";

describe("vehicle classes", () => {
  it("exposes exactly the three fleet classes", () => {
    expect(VEHICLE_CLASSES).toEqual(["Спорт", "Бизнес", "Премиум"]);
  });

  it("classifies representative fleet models", () => {
    expect(vehicleClassForCar("porsche-911-carrera-4s")).toBe("Спорт");
    expect(vehicleClassForCar("bmw-530d-2018")).toBe("Бизнес");
    expect(vehicleClassForCar("rolls-royce-wraith-2015")).toBe("Премиум");
  });
});
