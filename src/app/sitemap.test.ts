import { expect, it, vi } from "vitest";

vi.mock("@/lib/data", () => ({ getStore: async () => ({
  getCars: async () => [{ slug: "bmw", published: true }, { slug: "draft", published: false }],
  getLocations: async () => [{ slug: "office", published: true }, { slug: "hidden", published: false }]
}) }));
vi.mock("@/lib/seo", () => ({ siteUrl: "https://rpmrent.ru" }));

import sitemap from "./sitemap";
import robots from "./robots";

it("lists public cars and locations on the primary domain without invented modification dates", async () => {
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  expect(urls).toContain("https://rpmrent.ru/cars/bmw");
  expect(urls).toContain("https://rpmrent.ru/locations/office");
  expect(urls.some((url) => /draft|hidden|booking|admin|api/.test(url))).toBe(false);
  expect(entries.every((entry) => !entry.lastModified && entry.url.startsWith("https://rpmrent.ru"))).toBe(true);
  expect(new Set(urls).size).toBe(urls.length);
});

it("publishes the primary sitemap for crawlers", () => {
  expect(robots().sitemap).toBe("https://rpmrent.ru/sitemap.xml");
  expect(robots().host).toBe("https://rpmrent.ru");
});
