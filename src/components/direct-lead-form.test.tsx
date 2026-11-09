import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DirectLeadForm } from "./direct-lead-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("DirectLeadForm", () => {
  it("renders only the minimal Direct fields for a preselected car", () => {
    const html = renderToStaticMarkup(<DirectLeadForm car={{ id: "car-1", title: "Tesla Model 3", pricePerDay: 10_000 }} initialStart="2026-09-01" />);
    expect(html).toContain('id="direct-start"');
    expect(html).toContain('id="direct-phone"');
    expect(html).toContain("Tesla Model 3");
    expect(html).not.toContain("Адрес доставки");
    expect(html).not.toContain("Дополнительные услуги");
  });
});
