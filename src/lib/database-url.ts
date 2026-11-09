const trim = (value: string | undefined) => value?.trim();

const formatDatabaseUrl = (url: string) => {
  const trimmed = url.trim();
  return trimmed === "" ? undefined : trimmed;
};

const buildSupabaseUrl = () => {
  const projectRef = trim(process.env.SUPABASE_PROJECT_REF);
  const password = trim(process.env.SUPABASE_DB_PASSWORD) || trim(process.env.SUPABASE_PASSWORD);
  if (!projectRef || !password) return undefined;

  const dbUser = trim(process.env.SUPABASE_DB_USER) || "postgres";
  const dbName = trim(process.env.SUPABASE_DB_NAME) || "postgres";
  const dbHost = trim(process.env.SUPABASE_DB_HOST) || `db.${projectRef}.supabase.co`;
  const dbPort = trim(process.env.SUPABASE_DB_PORT) || "5432";

  return `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(password)}@${dbHost}:${dbPort}/${dbName}?sslmode=require`;
};

export const resolveDatabaseUrl = (): string | undefined => {
  return (
    formatDatabaseUrl(process.env.DATABASE_URL ?? "") ||
    formatDatabaseUrl(process.env.SUPABASE_DATABASE_URL ?? "") ||
    buildSupabaseUrl()
  );
};
