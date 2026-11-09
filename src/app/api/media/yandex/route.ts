import { buildYandexResourceUrl } from "@/lib/yandex-public-media";

export async function GET(request: Request) {
  const resourcePath = new URL(request.url).searchParams.get("path");
  if (!resourcePath) return new Response("Missing media path", { status: 400 });

  try {
    const response = await fetch(buildYandexResourceUrl(resourcePath), {
      next: { revalidate: 300 },
    });
    if (!response.ok) return new Response("Media not found", { status: response.status });
    const payload = await response.json() as { href?: string };
    if (!payload.href) return new Response("Media link unavailable", { status: 502 });
    const image = await fetch(payload.href);
    if (!image.ok || !image.body) return new Response("Media unavailable", { status: image.status || 502 });
    return new Response(image.body, {
      headers: {
        "Content-Type": image.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Invalid media path", { status: 400 });
  }
}
