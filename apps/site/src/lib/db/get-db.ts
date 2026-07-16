import { createDb } from "@repo/db/client";
import { isTursoRemote } from "@repo/db";
import { getServerEnv } from "@/lib/envs/server-env";

export function getDb() {
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = getServerEnv();

  if (isTursoRemote(DATABASE_URL) && !DATABASE_AUTH_TOKEN) {
    throw new Error("DATABASE_AUTH_TOKEN is required for Turso");
  }

  return createDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
}
