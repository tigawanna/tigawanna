import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));

const envPaths = [
  resolve(packageRoot, ".env"),
  resolve(packageRoot, ".env.local"),
  resolve(packageRoot, "../../apps/site/.env"),
  resolve(packageRoot, "../../apps/site/.env.local"),
];

for (const envPath of envPaths) {
  config({ path: envPath, override: false });
}

const DEFAULT_DATABASE_URL = `file:${resolve(packageRoot, "../../apps/site/local.db")}`;

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

const isTursoRemote =
  databaseUrl.startsWith("libsql://") &&
  !databaseUrl.includes("127.0.0.1") &&
  !databaseUrl.includes("localhost");

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: isTursoRemote ? "turso" : "sqlite",
  dbCredentials: isTursoRemote
    ? {
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
      }
    : {
        url: databaseUrl,
      },
});
