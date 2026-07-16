import { createClient as createHttpClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema/index.js";

export { DEFAULT_DATABASE_URL } from "./constants.js";

/**
 * Creates a Drizzle database client backed by `@libsql/client/http`.
 *
 * This module is intentionally free of Node-only imports (`node:fs`,
 * `node:path`, `node:module`, native libsql bindings) so it can be
 * safely resolved by the Vite client bundler without pulling
 * server-only code into the browser.
 *
 * For local file-based SQLite during development, use
 * {@link createLocalDb} from `@repo/db/local-client` in a
 * server-only context (e.g. a `.server.ts` file).
 */
export function createDb(url: string, authToken?: string) {
  const client = createHttpClient({ url, authToken });
  return drizzle(client, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;
