import { createDb } from "@/lib/drizzle/db";
import { getServerEnv } from "@/lib/server-env";

function isTursoRemote(url: string) {
  return url.startsWith("libsql://") && !url.includes("127.0.0.1") && !url.includes("localhost");
}

export function getDb() {
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = getServerEnv();

  if (isTursoRemote(DATABASE_URL) && !DATABASE_AUTH_TOKEN) {
    throw new Error("DATABASE_AUTH_TOKEN is required for Turso");
  }

  return createDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
}
