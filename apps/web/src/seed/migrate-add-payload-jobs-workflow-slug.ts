import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient, type Client } from "@libsql/client";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Resolves a libSQL / SQLite client from DATABASE_URL (+ optional auth token).
 */
function createDbClient(): Client {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";
  const url = databaseUrl.startsWith("file:")
    ? (() => {
        const raw = databaseUrl.slice("file:".length);
        const absolute = path.isAbsolute(raw) ? raw : path.resolve(dirname, "../..", raw);
        return `file:${absolute}`;
      })()
    : databaseUrl;

  return createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
}

/**
 * Returns whether a table exists.
 *
 * @param db - libSQL client.
 * @param table - Table name.
 */
async function tableExists(db: Client, table: string): Promise<boolean> {
  const result = await db.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [table],
  });
  return result.rows.length > 0;
}

/**
 * Returns whether a column exists on a table.
 *
 * @param db - libSQL client.
 * @param table - Table name.
 * @param column - Column name.
 */
async function columnExists(db: Client, table: string, column: string): Promise<boolean> {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => row.name === column);
}

/**
 * Adds `workflow_slug` to `payload_jobs` (required when `jobs.workflows` is configured).
 * Safe to re-run. Works for local `file:` SQLite and Turso (`libsql://`).
 */
async function migratePayloadJobsWorkflowSlug() {
  const db = createDbClient();

  if (!(await tableExists(db, "payload_jobs"))) {
    console.log("payload_jobs table missing — start the app once so Payload creates system tables");
    db.close();
    return;
  }

  if (await columnExists(db, "payload_jobs", "workflow_slug")) {
    console.log("workflow_slug already present");
    db.close();
    return;
  }

  await db.execute(`ALTER TABLE \`payload_jobs\` ADD COLUMN \`workflow_slug\` text`);
  console.log("added workflow_slug");
  db.close();
}

migratePayloadJobsWorkflowSlug().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
