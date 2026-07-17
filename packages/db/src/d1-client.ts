import { drizzle, type AnyD1Database } from "drizzle-orm/d1";

import * as schema from "./schema/index.js";

/**
 * Creates a Drizzle database client backed by Cloudflare D1.
 *
 * Pass the Workers / Wrangler D1 binding (e.g. `env.DB`). Keep this
 * module out of browser bundles — import it only from server-only
 * code (e.g. `.server.ts` or a Workers entry).
 *
 * Turso HTTP ({@link createDb} from `@repo/db/client`) stays available
 * for dual-write / import scripts while migrating data into D1.
 */
export function createD1Db(d1: AnyD1Database) {
  return drizzle(d1, { schema });
}

export type AppDatabase = ReturnType<typeof createD1Db>;
