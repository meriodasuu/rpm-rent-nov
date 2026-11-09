import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { parseStorageMediaUrl, storageMediaUrl, validateAdminMediaFile } from "@/lib/admin-media";
import { writeLocalMedia } from "@/lib/local-media";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });
  try {
    const rawPath = new URL(request.url).searchParams.get("path") || "";
    const path = parseStorageMediaUrl(storageMediaUrl(rawPath));
    if (!path) return NextResponse.json({ message: "Некорректный путь фотографии" }, { status: 400 });

    const body = new Uint8Array(await request.arrayBuffer());
    const validation = validateAdminMediaFile({ mimeType: request.headers.get("content-type")?.split(";", 1)[0] || "", size: body.byteLength });
    if (!validation.ok) return NextResponse.json({ message: validation.error }, { status: 400 });
    if (!await writeLocalMedia(path, body)) return NextResponse.json({ message: "Некорректный путь фотографии" }, { status: 400 });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Не удалось сохранить фотографию" }, { status: 500 });
  }
}
