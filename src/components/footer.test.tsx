import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("keeps the statement, logo, and legal navigation", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("rpm-logo-light.png");
    expect(html).toContain("rpm-logo-dark.png");
    expect(html).not.toContain("rpm-footer-cutout");
    expect(html).toContain("начинается здесь");
    expect(html).toContain("Политика в отношении обработки данных");
    expect(html).toContain("Политика cookie-файлов");
  });
});
