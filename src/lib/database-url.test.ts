import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./database-url";

describe("resolveDatabaseUrl", () => {
  it("returns DATABASE_URL when set", () => {
    process.env.DATABASE_URL = "postgresql://explicit@localhost:5432/rpm_rent";
    process.env.SUPABASE_PROJECT_REF = "";
    process.env.SUPABASE_DB_PASSWORD = "";
    expect(resolveDatabaseUrl()).toBe("postgresql://explicit@localhost:5432/rpm_rent");
  });

  it("builds url from Supabase env vars", () => {
    process.env.DATABASE_URL = "";
    process.env.SUPABASE_DATABASE_URL = "";
    process.env.SUPABASE_PROJECT_REF = "qwerty123";
    process.env.SUPABASE_DB_PASSWORD = "pass#word";
    process.env.SUPABASE_DB_USER = "postgres";
    process.env.SUPABASE_DB_NAME = "postgres";
    process.env.SUPABASE_DB_HOST = "";
    process.env.SUPABASE_DB_PORT = "";
    expect(resolveDatabaseUrl()).toBe("postgresql://postgres:pass%23word@db.qwerty123.supabase.co:5432/postgres?sslmode=require");
  });

  it("uses explicit Supabase database URL", () => {
    process.env.DATABASE_URL = "";
    process.env.SUPABASE_DATABASE_URL = "postgresql://x:y@z:5432/a?sslmode=require";
    process.env.SUPABASE_PROJECT_REF = "ignored";
    process.env.SUPABASE_DB_PASSWORD = "ignored";
    expect(resolveDatabaseUrl()).toBe("postgresql://x:y@z:5432/a?sslmode=require");
  });

  it("returns undefined when no configuration exists", () => {
    process.env.DATABASE_URL = "";
    process.env.SUPABASE_DATABASE_URL = "";
    process.env.SUPABASE_PROJECT_REF = "";
    process.env.SUPABASE_DB_PASSWORD = "";
    expect(resolveDatabaseUrl()).toBeUndefined();
  });
});

