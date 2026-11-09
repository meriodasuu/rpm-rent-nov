import { describe, expect, it } from "vitest";
import { buildCarSeoTitle, serializeJsonLd } from "./seo";

describe("car SEO titles", () => {
  it("adds the model year when two cars share the same SEO title", () => {
    const cars = [
      { slug: "bmw-x5-2022", title: "BMW X5", year: 2022, seoTitle: "BMW X5 в аренду — RPM Rent" },
      { slug: "bmw-x5-2020", title: "BMW X5", year: 2020, seoTitle: "BMW X5 в аренду — RPM Rent" }
    ];

    expect(buildCarSeoTitle(cars[0]!, cars)).toBe("BMW X5 2022 в аренду в Санкт-Петербурге | RPM Rent");
    expect(buildCarSeoTitle(cars[1]!, cars)).toBe("BMW X5 2020 в аренду в Санкт-Петербурге | RPM Rent");
  });

  it("keeps a unique SEO title and adds the location only once", () => {
    const car = { slug: "porsche-911", title: "Porsche 911 Carrera 4S", year: 2023, seoTitle: "Porsche 911 Carrera 4S — аренда в Санкт-Петербурге | RPM Rent" };
    expect(buildCarSeoTitle(car, [car])).toBe("Porsche 911 Carrera 4S — аренда в Санкт-Петербурге | RPM Rent");
  });

});

describe("structured data serialization", () => {
  it("prevents content from ending the script element while retaining its value", () => {
    const value = { name: '</script><script>alert("x")</script>' };
    const encoded = serializeJsonLd(value);
    expect(encoded).not.toContain("<");
    expect(JSON.parse(encoded)).toEqual(value);
  });
});
