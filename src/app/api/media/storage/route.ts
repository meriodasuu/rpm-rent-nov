import { NextResponse } from "next/server";
import { parseStorageMediaUrl, storageMediaUrl } from "@/lib/admin-media";
import { downloadStorageObject } from "@/lib/supabase-storage";
import { readLocalMedia } from "@/lib/local-media";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get("path") ?? "";
  const path = parseStorageMediaUrl(storageMediaUrl(rawPath));
  if (!path) return NextResponse.json({ message: "Некорректный путь фотографии" }, { status: 400 });
  try {
    const local = await readLocalMedia(path);
    if (local) {
      const headers = new Headers({ "Content-Type": local.contentType, "Cache-Control": "public, max-age=31536000, immutable" });
      if (url.searchParams.get("download") === "1") headers.set("Content-Disposition", `attachment; filename="${path.split("/").at(-1)}"`);
      return new Response(new Uint8Array(local.body), { status: 200, headers });
    }
    const source = await downloadStorageObject(path);
    const headers = new Headers();
    headers.set("Content-Type", source.headers.get("content-type") || "application/octet-stream");
    headers.set("Cache-Control", "private, max-age=300");
    if (url.searchParams.get("download") === "1") {
      headers.set("Content-Disposition", `attachment; filename="${path.split("/").at(-1)}"`);
    }
    return new Response(source.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ message: "Фотография не найдена" }, { status: 404 });
  }
}
