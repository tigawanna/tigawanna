import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const LOCAL_D1_DIR = path.resolve(".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

function getLocalD1Url(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (!fs.existsSync(LOCAL_D1_DIR)) {
    throw new Error(
      'Local D1 database not found. Run "pnpm db:migrate:local" first, or set DATABASE_URL.',
    );
  }

  const sqliteFiles = fs
    .readdirSync(LOCAL_D1_DIR)
    .filter((file) => file.endsWith(".sqlite") && file !== "metadata.sqlite")
    .map((file) => path.join(LOCAL_D1_DIR, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  const latest = sqliteFiles[0];
  if (!latest) {
    throw new Error(
      'Local D1 database not found. Run "pnpm db:migrate:local" first, or set DATABASE_URL.',
    );
  }

  return latest;
}

export default defineConfig({
  schema: "./src/lib/drizzle/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalD1Url(),
  },
});
