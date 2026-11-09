import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CarGallery } from "./car-gallery";

describe("CarGallery", () => {
  it("renders Storage proxy images without the Next image optimizer", () => {
    const html = renderToStaticMarkup(<CarGallery title="Porsche 911" images={[{
      url: "/api/media/storage?path=cars%2Fcar-porsche-911%2Ffb424ac1-988c-4fd9-8e52-2a2cbc83cca2.jpg",
      alt: "Porsche 911",
    }]} />);

    expect(html).toContain('src="/api/media/storage?path=cars%2Fcar-porsche-911%2Ffb424ac1-988c-4fd9-8e52-2a2cbc83cca2.jpg"');
    expect(html).not.toContain("/_next/image?url=%2Fapi%2Fmedia%2Fstorage");
  });
});
