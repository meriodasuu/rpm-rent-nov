import type { OriginDomain } from "@/types/domain";

const originDomains = new Set<OriginDomain>(["rpm-rent.ru", "rpmrent.ru"]);

export const getRequestOriginDomain = (request: Request): OriginDomain | null => {
  const hostname = (request.headers.get("host")?.split(":")[0] || new URL(request.url).hostname)
    .toLowerCase()
    .replace(/^www\./, "");
  return originDomains.has(hostname as OriginDomain) ? hostname as OriginDomain : null;
};
