import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarImportedDetails } from "./car-imported-details";

describe("CarImportedDetails", () => {
  it("shows imported workbook characteristics and tariffs", () => {
    const html = renderToStaticMarkup(
      <CarImportedDetails
        features={["Поколение: F91/F92 (2019—2022)", "Комплектация: Competition", "Разгон: 0–100 км/ч — 3.2 сек"]}
        rentalConditions={["Тариф на 12 часов не указан", "3–7 суток — 33 000 ₽/сутки"]}
      />,
    );
    expect(html).toContain("F91/F92 (2019—2022)");
    expect(html).toContain("Competition");
    expect(html).toContain("33 000 ₽/сутки");
  });
});
