export const ADMIN_MEDIA_MAX_BYTES = 15 * 1024 * 1024;
export const ADMIN_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AdminMediaType = (typeof ADMIN_MEDIA_TYPES)[number];
export type AdminMediaOwnerType = "cars" | "locations";

const extensions: Record<AdminMediaType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const validateAdminMediaFile = ({ mimeType, size }: { mimeType: string; size: number }) => {
  if (!ADMIN_MEDIA_TYPES.includes(mimeType as AdminMediaType)) {
    return { ok: false as const, error: "Разрешены только JPEG, PNG и WebP" };
  }
  if (!Number.isFinite(size) || size <= 0 || size > ADMIN_MEDIA_MAX_BYTES) {
    return { ok: false as const, error: "Файл должен быть не больше 15 МБ" };
  }
  return { ok: true as const };
};

export const buildAdminMediaPath = (
  ownerType: AdminMediaOwnerType,
  ownerId: string,
  mimeType: string,
  uuid = crypto.randomUUID(),
) => {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(ownerId)) throw new Error("Некорректный идентификатор");
  if (!ADMIN_MEDIA_TYPES.includes(mimeType as AdminMediaType)) throw new Error("Неподдерживаемый формат файла");
  return `${ownerType}/${ownerId}/${uuid}.${extensions[mimeType as AdminMediaType]}`;
};

export const storageMediaUrl = (path: string) => `/api/media/storage?path=${encodeURIComponent(path)}`;

export const isStorageMediaUrl = (url: string) => url.startsWith("/api/media/storage?path=");

export const parseStorageMediaUrl = (url: string) => {
  if (!url.startsWith("/api/media/storage?")) return null;
  const path = new URL(url, "https://rpm-rent.local").searchParams.get("path");
  return path && /^(cars|locations)\/[A-Za-z0-9_-]{1,100}\/[0-9a-f-]+\.(jpg|png|webp)$/.test(path) ? path : null;
};
