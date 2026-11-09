import { defineConfig } from "prisma/config";

const resolveConfigDatabaseUrl = () => process.env.DATABASE_URL?.trim()
  || process.env.SUPABASE_DATABASE_URL?.trim()
  || (() => {
    const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
    const password = process.env.SUPABASE_DB_PASSWORD?.trim() || process.env.SUPABASE_PASSWORD?.trim();
    if (!projectRef || !password) return undefined;
    const dbUser = process.env.SUPABASE_DB_USER?.trim() || "postgres";
    const dbName = process.env.SUPABASE_DB_NAME?.trim() || "postgres";
    const dbHost = process.env.SUPABASE_DB_HOST?.trim() || `db.${projectRef}.supabase.co`;
    const dbPort = process.env.SUPABASE_DB_PORT?.trim() || "5432";
    return `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(password)}@${dbHost}:${dbPort}/${dbName}?sslmode=require`;
  })();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: resolveConfigDatabaseUrl() ?? "postgresql://localhost:5432/rpm_rent"
  }
});
