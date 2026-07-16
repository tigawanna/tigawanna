import { createClient as createHttpClient } from "@libsql/client/http";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema/index.js";
import { isTursoRemote } from "./turso.js";

export { DEFAULT_DATABASE_URL } from "./constants.js";

const require = createRequire(import.meta.url);
const clientDir = dirname(fileURLToPath(import.meta.url));

/**
 * Returns true when Node failed to resolve a lazy local-client import.
 */
function isModuleNotFoundError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND"
  );
}

/**
 * Lazily loads the local SQLite client without pulling native libsql bindings
 * into remote-only deployments. When the package is consumed from `src/` during
 * dev, the compiled `dist/local-client.js` fallback is used.
 */
function requireLocalClient() {
  const candidates = [
    join(clientDir, "local-client.js"),
    join(clientDir, "../dist/local-client.js"),
  ];

  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      return require(candidate) as typeof import("./local-client.js");
    } catch (error: unknown) {
      lastError = error;
      if (isModuleNotFoundError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Cannot find local-client module. Run `pnpm --filter @repo/db build` and retry.",
    { cause: lastError },
  );
}

/**
 * Creates a Drizzle database client for Turso (HTTP) or local file SQLite.
 * Remote Turso uses `@libsql/client/http` so native libsql bindings are not loaded in production.
 */
export function createDb(url: string, authToken?: string) {
  if (isTursoRemote(url)) {
    const client = createHttpClient({ url, authToken });
    return drizzle(client, { schema });
  }

  const { createLocalDb } = requireLocalClient();
  return createLocalDb(url, authToken);
}

export type AppDatabase = ReturnType<typeof createDb>;
