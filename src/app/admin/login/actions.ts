"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, verifyPassword } from "@/lib/auth";
import { FixedWindowRateLimiter } from "@/lib/rate-limit";

export type LoginState = { error: string };

const limiter = new FixedWindowRateLimiter(5, 15 * 60_000);

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const requestHeaders = await headers();
  const address = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const key = `${address}:${email.slice(0, 160)}`;
  const rate = limiter.attempt(key);
  if (!rate.allowed) return { error: "Слишком много попыток. Повторите вход через 15 минут." };
  const passwordIsValid = password.length <= 200 && verifyPassword(password);
  if (!adminEmail || email !== adminEmail || !passwordIsValid) return { error: "Неверный email или пароль" };
  limiter.clear(key);
  await createSession(email);
  redirect("/admin");
}
