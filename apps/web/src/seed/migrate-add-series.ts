import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient, type Client } from "@libsql/client";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Resolves DATABASE_URL, making relative `file:` paths absolute from `apps/web`.
 */
function resolveDatabaseUrl(databaseUrl: string): string {
  if (!databaseUrl.startsWith("file:")) return databaseUrl;
  const raw = databaseUrl.slice("file:".length);
  return `file:${path.isAbsolute(raw) ? raw : path.resolve(dirname, "../..", raw)}`;
}

/**
 * Returns whether a table exists.
 */
async function tableExists(db: Client, table: string): Promise<boolean> {
  const { rows } = await db.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [table],
  });
  return rows.length > 0;
}

/**
 * Returns whether a column exists on a table.
 */
async function columnExists(db: Client, table: string, column: string): Promise<boolean> {
  const { rows } = await db.execute(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

/**
 * Adds a nullable FK column + index when missing.
 */
async function addReferenceColumn(
  db: Client,
  options: { table: string; column: string; index: string; onDelete: "set null" | "cascade" },
) {
  const { table, column, index, onDelete } = options;
  if (await columnExists(db, table, column)) {
    console.log(`${table}.${column} already present`);
    return;
  }
  await db.batch(
    [
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` integer REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE ${onDelete};`,
      `CREATE INDEX IF NOT EXISTS \`${index}\` ON \`${table}\` (\`${column}\`);`,
    ],
    "write",
  );
  console.log(`Added ${table}.${column}`);
}

/**
 * Creates the `series` collection table and links it from blogs (+ versions, doc locks).
 * Safe to re-run. Works on local `file:` SQLite and Turso (`libsql://` + auth token).
 */
async function migrateAddSeries() {
  const url = resolveDatabaseUrl(process.env.DATABASE_URL || "file:./payload.db");
  console.log(`Migrating ${url.startsWith("file:") ? url : new URL(url).host}`);

  const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });

  if (!(await tableExists(db, "series"))) {
    await db.batch(
      [
        `CREATE TABLE \`series\` (
          \`id\` integer PRIMARY KEY NOT NULL,
          \`title\` text NOT NULL,
          \`description\` text,
          \`devto_collection_id\` numeric,
          \`generate_slug\` integer DEFAULT true,
          \`slug\` text NOT NULL,
          \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
          \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
        );`,
        "CREATE UNIQUE INDEX `series_devto_collection_id_idx` ON `series` (`devto_collection_id`);",
        "CREATE UNIQUE INDEX `series_slug_idx` ON `series` (`slug`);",
        "CREATE INDEX `series_updated_at_idx` ON `series` (`updated_at`);",
        "CREATE INDEX `series_created_at_idx` ON `series` (`created_at`);",
      ],
      "write",
    );
    console.log("Created series");
  } else {
    console.log("series already present");
  }

  await addReferenceColumn(db, {
    table: "blogs",
    column: "series_id",
    index: "blogs_series_idx",
    onDelete: "set null",
  });
  await addReferenceColumn(db, {
    table: "_blogs_v",
    column: "version_series_id",
    index: "_blogs_v_version_version_series_idx",
    onDelete: "set null",
  });
  if (await tableExists(db, "payload_locked_documents_rels")) {
    await addReferenceColumn(db, {
      table: "payload_locked_documents_rels",
      column: "series_id",
      index: "payload_locked_documents_rels_series_id_idx",
      onDelete: "cascade",
    });
  }

  db.close();
}

await migrateAddSeries();
