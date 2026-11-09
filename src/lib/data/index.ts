import { FileStore } from "./file-store";
import type { DataStore } from "./store";
import { resolveDatabaseUrl } from "@/lib/database-url";

let store: DataStore | undefined;

export const getStore = async (): Promise<DataStore> => {
  if (store) return store;
  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl?.startsWith("postgres")) {
    const { PrismaStore } = await import("./prisma-store");
    store = new PrismaStore();
  } else {
    if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL?.trim().length) {
      throw new Error("DATABASE_URL is configured but invalid; fallback to FileStore is disabled in production.");
    }
    if (!databaseUrl && process.env.NODE_ENV !== "test") {
      console.info("DATABASE_URL is not configured, using file-based data store.");
    }
    store = new FileStore();
  }
  return store;
};
