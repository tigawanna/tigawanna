import { createDb } from "@repo/db/client";
import { createLocalDb } from "@repo/db/local-client";
import { isTursoRemote } from "@repo/db";
import { getServerEnv } from "@/lib/envs/server-env";

/**
 * Returns a Drizzle database client for the current environment.
 *
 * Remote Turso URLs use the browser-safe HTTP transport; local
 * `file:` URLs use the native libsql client. This file carries
 * the `.server.ts` suffix so TanStack Start / Vite never includes
 * it (or its native-only transitive deps) in the client bundle.
 */
export function getDb() {
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = getServerEnv();

  if (isTursoRemote(DATABASE_URL)) {
    if (!DATABASE_AUTH_TOKEN) {
      throw new Error("DATABASE_AUTH_TOKEN is required for Turso");
    }
    return createDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
  }

  return createLocalDb(DATABASE_URL, DATABASE_AUTH_TOKEN);
}
