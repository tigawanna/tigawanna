import { defineConfig } from "drizzle-kit";

/**
 * Local D1 / sqlite studio config for the portfolio app.
 * Schema + SQL migrations still live in `@repo/db`.
 *
 * After `pnpm dev` or `pnpm db:migrate:local`, point DATABASE_URL at the
 * Miniflare sqlite file under `.wrangler/state/v3/d1/` (see `db:studio`).
 */
export default defineConfig({
  schema: "../../packages/db/src/schema/index.ts",
  out: "../../packages/db/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder.sqlite",
  },
});
