import { describe, expect, it } from "vitest";
import {
  ADMIN_MEDIA_MAX_BYTES,
  buildAdminMediaPath,
  parseStorageMediaUrl,
  storageMediaUrl,
  validateAdminMediaFile,
} from "./admin-media";

describe("admin media", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (mimeType) => {
    expect(validateAdminMediaFile({ mimeType, size: ADMIN_MEDIA_MAX_BYTES })).toEqual({ ok: true });
  });

  it("rejects unsupported and oversized files", () => {
    expect(validateAdminMediaFile({ mimeType: "image/svg+xml", size: 10 })).toEqual({ ok: false, error: "Разрешены только JPEG, PNG и WebP" });
    expect(validateAdminMediaFile({ mimeType: "image/jpeg", size: ADMIN_MEDIA_MAX_BYTES + 1 })).toEqual({ ok: false, error: "Файл должен быть не больше 15 МБ" });
  });

  it("builds a deterministic owned path", () => {
    expect(buildAdminMediaPath("cars", "car_123", "image/jpeg", "123e4567-e89b-12d3-a456-426614174000")).toBe(
      "cars/car_123/123e4567-e89b-12d3-a456-426614174000.jpg",
    );
    expect(() => buildAdminMediaPath("locations", "../escape", "image/png", "id")).toThrow("Некорректный идентификатор");
  });

  it("round-trips storage proxy URLs", () => {
    const path = "locations/location-1/123e4567-e89b-12d3-a456-426614174000.webp";
    expect(parseStorageMediaUrl(storageMediaUrl(path))).toBe(path);
    expect(parseStorageMediaUrl("https://example.com/photo.jpg")).toBeNull();
  });
});
