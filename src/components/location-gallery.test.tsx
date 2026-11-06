import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocationGallery } from "./location-gallery";

describe("LocationGallery", () => {
  it("renders Storage proxy images through the Next image optimizer", () => {
    const html = renderToStaticMarkup(<LocationGallery
      title="Охта Парк"
      subtitle="Личный маршрут"
      images={["/api/media/storage?path=locations%2Flocation-city-centre%2F2102885b-3d88-40d1-b030-2f6aecf788ae.jpg"]}
    />);

    expect(html).toContain("/_next/image?url=%2Fapi%2Fmedia%2Fstorage");
  });
});
