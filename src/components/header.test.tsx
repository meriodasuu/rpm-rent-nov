import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { Header } from "./header";

describe("Header", () => {
  it("does not render the temporary font preview control", () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).not.toContain("Предпросмотр шрифта");
    expect(html).not.toContain(">Шрифт</summary>");
  });
});
