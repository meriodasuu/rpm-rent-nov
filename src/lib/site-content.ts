export type SocialKind = "telegram" | "instagram" | "generic";

export const socialEventSlug = (label: string) => ({ MAX: "max_click", "ВКонтакте": "social_vk_click", Instagram: "social_instagram_click", TikTok: "social_tiktok_click", YouTube: "social_youtube_click", Telegram: "telegram_click", Авито: "social_avito_click", Сайт: "social_site_click" }[label] ?? "social_other_click");

export const normalizeSocialUrl = (kind: SocialKind, value: string): string => {
  if (/^https:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^\/+/, "");
  if (kind === "telegram") return `https://t.me/${handle}`;
  if (kind === "instagram") return `https://www.instagram.com/${handle}`;
  return `https://${handle}`;
};

export const CONTACTS = {
  phone: "+7 993 983-80-80",
  phoneHref: "tel:+79939838080",
  max: { phone: "+7 993 983-80-80", href: "https://max.ru/" },
  address: "Санкт-Петербург, Пискаревский проспект, 144АК, 2 этаж",
  website: "https://rpmrent.ru",
  mapHref: "https://yandex.ru/maps/?text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D0%9F%D0%B8%D1%81%D0%BA%D0%B0%D1%80%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2C%20144%D0%90%D0%9A%2C%202%20%D1%8D%D1%82%D0%B0%D0%B6",
  mapEmbed: "https://yandex.ru/map-widget/v1/?mode=search&text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D0%9F%D0%B8%D1%81%D0%BA%D0%B0%D1%80%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2C%20144%D0%90%D0%9A%2C%202%20%D1%8D%D1%82%D0%B0%D0%B6&z=16",
  socials: [
    { label: "MAX", href: "https://max.ru/" },
    { label: "ВКонтакте", href: normalizeSocialUrl("generic", "https://vk.ru/rpm_rent") },
    { label: "Instagram", href: normalizeSocialUrl("instagram", "rpm_rent") },
    { label: "TikTok", href: normalizeSocialUrl("generic", "https://www.tiktok.com/@rpmrent") },
    { label: "YouTube", href: normalizeSocialUrl("generic", "https://youtube.com/@rpm_rent_yt") },
    { label: "Telegram", href: normalizeSocialUrl("telegram", "rpmrent") },
    { label: "Авито", href: normalizeSocialUrl("generic", "https://m.avito.ru/brands/rpmrent") },
    { label: "Сайт", href: normalizeSocialUrl("generic", "https://rpmrent.ru") }
  ]
} as const;

export const LOCATIONS = [
  { title: "Центр Петербурга", subtitle: "Личный маршрут", image: "/images/atmosphere/saint-petersburg-blue-hour.png", href: "/cars?class=Спорт" },
  { title: "Петроградская сторона", subtitle: "Город и пространство", image: "/images/cars/li-auto-l6/01.jpg", href: "/cars?class=Бизнес" },
  { title: "Дворцовая набережная", subtitle: "Особый повод", image: "/images/cars/bentley-continental/02.jpg", href: "/cars?class=Премиум" },
  { title: "Курортный маршрут", subtitle: "Долгая поездка", image: "/images/cars/lamborghini-urus/05.jpg", href: "/cars?class=Премиум" }
] as const;

export const ROUTE_CATEGORIES = [
  { label: "Для города", href: "/cars?class=Спорт", icon: "city" },
  { label: "Для деловой поездки", href: "/cars?class=Бизнес", icon: "business" },
  { label: "Для события", href: "/cars?class=Премиум", icon: "event" },
  { label: "На длительный срок", href: "/cars?class=Бизнес", icon: "long" }
] as const;
