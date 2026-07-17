import { createD1Db } from "@repo/db/d1-client";
import { env } from "cloudflare:workers";

/**
 * Returns a Drizzle database client backed by the Cloudflare D1 binding.
 *
 * Bindings come from Wrangler / `@cloudflare/vite-plugin` via
 * `cloudflare:workers`. Turso HTTP (`@repo/db/client`) stays available
 * for one-off import scripts, not runtime.
 */
export function getDb() {
  return createD1Db(env.DB);
}
