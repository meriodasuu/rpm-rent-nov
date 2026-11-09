import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "rpm_admin_session";
const maxAge = 60 * 60 * 10;

const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters");
  return value;
};

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export const createSession = async (email: string) => {
  const payload = Buffer.from(JSON.stringify({ email, expires: Date.now() + maxAge * 1000 })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
};

export const clearSession = async () => (await cookies()).delete(cookieName);

export const getAdminSession = async (): Promise<{ email: string } | null> => {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; expires?: unknown };
    if (typeof parsed.email !== "string" || typeof parsed.expires !== "number" || parsed.expires < Date.now()) return null;
    return { email: parsed.email };
  } catch { return null; }
};

export const requireAdmin = async () => {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
};

export const verifyPassword = (password: string) => {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!encoded) return false;
  const separator = encoded.includes(":") ? ":" : "$";
  const [algorithm, n, r, p, saltHex, hashHex] = encoded.split(separator);
  if (algorithm !== "scrypt" || !n || !r || !p || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
};
