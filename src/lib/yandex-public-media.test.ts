import { describe, expect, it } from "vitest";
import { buildYandexResourceUrl, isYandexMediaUrl } from "./yandex-public-media";

describe("Yandex public media URL", () => {
  it("builds an encoded API request for a file path", () => {
    const url = buildYandexResourceUrl("/BMW/М8_150/ИИ NEW/1.jpg");
    expect(url.origin).toBe("https://cloud-api.yandex.net");
    expect(url.pathname).toBe("/v1/disk/public/resources/download");
    expect(url.searchParams.get("public_key")).toBe("https://disk.yandex.ru/d/10Aae1ngI1Cydg");
    expect(url.searchParams.get("path")).toBe("/BMW/М8_150/ИИ NEW/1.jpg");
  });

  it("rejects traversal and non-absolute paths", () => {
    expect(() => buildYandexResourceUrl("../secret.jpg")).toThrow("Invalid Yandex Disk path");
    expect(() => buildYandexResourceUrl("/BMW/../secret.jpg")).toThrow("Invalid Yandex Disk path");
  });

  it("identifies only the local Yandex media proxy", () => {
    expect(isYandexMediaUrl("/api/media/yandex?path=%2FBMW%2Fphoto.jpg")).toBe(true);
    expect(isYandexMediaUrl("/images/cars/bmw/01.jpg")).toBe(false);
  });
});
