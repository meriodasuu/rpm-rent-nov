import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { parseStorageMediaUrl } from "@/lib/admin-media";
import { removeLocalMedia } from "@/lib/local-media";
import { removeStorageObject } from "@/lib/supabase-storage";

export async function DELETE(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });
  try {
    const body = await request.json() as { mediaUrl?: unknown };
    const path = typeof body.mediaUrl === "string" ? parseStorageMediaUrl(body.mediaUrl) : null;
    if (!path) return NextResponse.json({ message: "Некорректный путь фотографии" }, { status: 400 });
    if (await removeLocalMedia(path)) return NextResponse.json({ ok: true });
    await removeStorageObject(path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Не удалось удалить фотографию" }, { status: 500 });
  }
}
