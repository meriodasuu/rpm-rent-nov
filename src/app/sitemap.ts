import type { MetadataRoute } from "next";
import { getStore } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/cars", "/services", "/rental-terms", "/about", "/faq", "/contacts", "/privacy", "/data-processing", "/personal-data-policy", "/cookies"];
  const store = await getStore();
  const [cars, locations] = await Promise.all([store.getCars(), store.getLocations()]);
  // No reliable modification timestamp exists in these records. Omit lastmod
  // rather than reporting every URL as changed on every crawler request.
  return [
    ...paths.map((path) => ({ url: `${siteUrl}${path}` })),
    ...cars.filter((car) => car.published).map((car) => ({ url: `${siteUrl}/cars/${car.slug}` })),
    ...locations.filter((location) => location.published).map((location) => ({ url: `${siteUrl}/locations/${location.slug}` }))
  ];
}
