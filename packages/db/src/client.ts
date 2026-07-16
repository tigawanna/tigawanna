import { createClient as createHttpClient } from "@libsql/client/http";
import { createRequire } from "node:module";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema/index.js";
import { isTursoRemote } from "./turso.js";

export { DEFAULT_DATABASE_URL } from "./constants.js";

const require = createRequire(import.meta.url);

/**
 * Creates a Drizzle database client for Turso (HTTP) or local file SQLite.
 * Remote Turso uses `@libsql/client/http` so native libsql bindings are not loaded in production.
 */
export function createDb(url: string, authToken?: string) {
  if (isTursoRemote(url)) {
    const client = createHttpClient({ url, authToken });
    return drizzle(client, { schema });
  }

  const { createLocalDb } = require("./local-client.js") as typeof import("./local-client.js");
  return createLocalDb(url, authToken);
}

export type AppDatabase = ReturnType<typeof createDb>;
