import { describe, expect, it } from "vitest";
import { getPaidTrafficSource, isYandexDirectAttribution } from "./direct-traffic";

it.each(["vk", "VK", "vk_ads", "vkontakte"])("recognizes VK source %s", (source) => {
  expect(getPaidTrafficSource(new URLSearchParams({ utm_source: source, yclid: "old" }))).toBe("vk_ads");
});
it("supports VK click IDs and gives explicit sources precedence", () => {
  expect(getPaidTrafficSource(new URLSearchParams("rb_clickid=123"))).toBe("vk_ads");
  expect(getPaidTrafficSource(new URLSearchParams("utm_source=yandex&rb_clickid=old"))).toBe("yandex_direct");
  expect(getPaidTrafficSource(new URLSearchParams("utm_source=google&rb_clickid=old"))).toBeNull();
});

describe("isYandexDirectAttribution", () => {
  it("recognizes a Yandex Direct click id", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("yclid=123456"))).toBe(true);
  });

  it("recognizes a Yandex UTM source regardless of letter case", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("utm_source=Yandex"))).toBe(true);
  });

  it("does not classify unrelated UTM traffic as Direct", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("utm_source=google&utm_medium=cpc"))).toBe(false);
  });
});
