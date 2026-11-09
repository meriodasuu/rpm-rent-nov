import { resolveDatabaseUrl } from "../src/lib/database-url";

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) {
  console.error("DATABASE_URL is not configured. Set DATABASE_URL or Supabase variables (SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD).");
  process.exit(1);
}

try {
  new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL looks invalid. Check protocol/characters in DATABASE_URL / SUPABASE_*.");
  process.exit(1);
}

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  console.error("AUTH_SECRET is missing or too short for admin sessions.");
  process.exit(1);
}

if (!process.env.ADMIN_EMAIL?.trim()) {
  console.error("ADMIN_EMAIL is required for admin login.");
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD_HASH?.trim()) {
  console.error("ADMIN_PASSWORD_HASH is required for admin login.");
  process.exit(1);
}

console.log("Environment check passed.");
console.log(`Database mode: ${databaseUrl.startsWith("postgres") ? "PostgreSQL (Prisma)" : "file-based"}.`);
console.log(`Database host: ${(new URL(databaseUrl).hostname)}`);
console.log(`Admin user email: ${process.env.ADMIN_EMAIL}`);
