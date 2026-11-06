import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { bookingSchema } from "@/lib/validation";
import { DomainError } from "@/lib/domain/errors";
import { FixedWindowRateLimiter } from "@/lib/rate-limit";
import { notifyBookingCreated } from "@/lib/telegram";
import { getRequestOriginDomain } from "@/lib/request-domain";

const limiter = new FixedWindowRateLimiter(8, 60_000);

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 32_768) return NextResponse.json({ message: "Объём данных слишком большой" }, { status: 413 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || "local";
  const rate = limiter.attempt(key);
  if (!rate.allowed) return NextResponse.json(
    { message: "Слишком много попыток. Попробуйте позднее." },
    { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
  );
  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 32_768) return NextResponse.json({ message: "Объём данных слишком большой" }, { status: 413 });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ message: "Некорректный формат данных" }, { status: 400 }); }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Проверьте заполнение формы", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  try {
    const store = await getStore();
    const booking = await store.createBooking(parsed.data, getRequestOriginDomain(request));
    try {
      await notifyBookingCreated(booking, await store.getTelegramOperators());
    } catch (error) {
      console.error("booking.telegram-notification.failed", error instanceof Error ? error.name : "UnknownError");
    }
    if (process.env.CRM_WEBHOOK_URL) {
      fetch(process.env.CRM_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "booking.created", booking }) }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, id: booking.id }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ message: error.message, code: error.code, errors: error.fieldErrors }, { status: error.status });
    }
    console.error("booking.create.failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ message: "Не удалось сохранить обращение. Попробуйте ещё раз позднее." }, { status: 500 });
  }
}
