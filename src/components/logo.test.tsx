import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Logo } from "./logo";

describe("Logo", () => {
  it("includes both theme-specific RPM logo sources", () => {
    const html = renderToStaticMarkup(<Logo />);

    expect(html).toContain("/images/brand/rpm-logo-light.png");
    expect(html).toContain("/images/brand/rpm-logo-dark.png");
    expect(html).not.toContain("<span>RPM</span>");
  });
});
