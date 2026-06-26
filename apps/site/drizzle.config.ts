import { defineConfig } from "drizzle-kit";

const DEFAULT_DATABASE_URL = "file:./local.db";

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

const isTursoRemote =
  databaseUrl.startsWith("libsql://") &&
  !databaseUrl.includes("127.0.0.1") &&
  !databaseUrl.includes("localhost");

export default defineConfig({
  schema: "./src/lib/drizzle/schema/index.ts",
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
