const PUBLIC_KEY = "https://disk.yandex.ru/d/10Aae1ngI1Cydg";

export const isYandexMediaUrl = (url: string) => url.startsWith("/api/media/yandex?path=");

export const buildYandexResourceUrl = (resourcePath: string) => {
  if (!resourcePath.startsWith("/") || resourcePath.split("/").includes("..")) {
    throw new Error("Invalid Yandex Disk path");
  }
  const url = new URL("https://cloud-api.yandex.net/v1/disk/public/resources/download");
  url.searchParams.set("public_key", PUBLIC_KEY);
  url.searchParams.set("path", resourcePath);
  return url;
};
