import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminMediaUploader, moveMediaItem } from "./admin-media-uploader";

describe("AdminMediaUploader", () => {
  it("renders existing images as ordered form values and exposes core actions", () => {
    const html = renderToStaticMarkup(
      <AdminMediaUploader name="images" ownerType="cars" ownerId="car-1" initialImages={["/one.jpg", "/two.jpg"]} mode="multiple" />,
    );
    expect(html).toContain('name="images"');
    expect(html).toContain('value="/one.jpg"');
    expect(html).toContain("Обложка");
    expect(html).toContain("Скачать");
    expect(html).toContain("Удалить");
    expect(html).toContain('multiple=""');
  });

  it("renders a single-image picker without multiple selection", () => {
    const html = renderToStaticMarkup(
      <AdminMediaUploader name="image" ownerType="locations" ownerId="location-1" initialImages={[]} mode="single" />,
    );
    expect(html).toContain("Перетащите изображение сюда");
    expect(html).not.toContain('multiple=""');
  });

  it("moves media without losing items", () => {
    expect(moveMediaItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveMediaItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
});
