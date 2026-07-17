import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

/**
 * Local D1 / sqlite studio config for the dashboard app.
 * Schema + SQL migrations still live in `@repo/db`.
 */
export default defineConfig({
  schema: "../../packages/db/src/schema/index.ts",
  out: "../../packages/db/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url:
      env.DATABASE_URL ??
      "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder.sqlite",
  },
});
