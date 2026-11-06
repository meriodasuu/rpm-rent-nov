export const isYandexDirectAttribution = (params: URLSearchParams) => {
  if (params.get("yclid")?.trim()) return true;
  return params.get("utm_source")?.trim().toLowerCase() === "yandex";
};

export function getPaidTrafficSource(params: URLSearchParams): "yandex_direct" | "vk_ads" | null {
  const source = params.get("utm_source")?.trim().toLowerCase();
  // Explicit UTM source wins over click IDs left by an earlier campaign.
  if (source) {
    if (["vk", "vk_ads", "vkontakte"].includes(source)) return "vk_ads";
    if (source === "yandex") return "yandex_direct";
    return null;
  }
  if (params.get("rb_clickid")?.trim()) return "vk_ads";
  return isYandexDirectAttribution(params) ? "yandex_direct" : null;
}

export const isPaidLeadAttribution = (params: URLSearchParams) => getPaidTrafficSource(params) !== null;
export const trafficSourceLabel = (source: string) => source === "vk_ads" ? "VK Реклама" : source === "yandex_direct" ? "Яндекс.Директ" : "Сайт";
