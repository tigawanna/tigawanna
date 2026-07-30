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
 */
async function columnExists(db: Client, table: string, column: string): Promise<boolean> {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => row.name === column);
}

/**
 * Creates Payload `repositories` (+ topics array) tables.
 * Safe to re-run. Works for local `file:` SQLite and Turso (`libsql://`).
 */
async function migrateRepositories() {
  const db = createDbClient();

  if (!(await tableExists(db, "repositories"))) {
    await db.batch(
      [
        `CREATE TABLE \`repositories\` (
          \`id\` integer PRIMARY KEY NOT NULL,
          \`name\` text NOT NULL,
          \`name_with_owner\` text NOT NULL,
          \`url\` text NOT NULL,
          \`homepage_url\` text,
          \`open_graph_image_url\` text,
          \`description\` text,
          \`description_h_t_m_l\` text,
          \`category\` text,
          \`featured\` integer DEFAULT false NOT NULL,
          \`pushed_at\` text NOT NULL,
          \`is_private\` integer DEFAULT false NOT NULL,
          \`is_fork\` integer DEFAULT false,
          \`is_archived\` integer DEFAULT false,
          \`stargazer_count\` numeric,
          \`fork_count\` numeric,
          \`last_synced_at\` text,
          \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
          \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
        )`,
        `CREATE UNIQUE INDEX \`repositories_name_with_owner_idx\` ON \`repositories\` (\`name_with_owner\`)`,
        `CREATE INDEX \`repositories_updated_at_idx\` ON \`repositories\` (\`updated_at\`)`,
        `CREATE INDEX \`repositories_created_at_idx\` ON \`repositories\` (\`created_at\`)`,
      ],
      "write",
    );
    console.log("Created repositories");
  } else {
    console.log("repositories already present");
  }

  if (!(await tableExists(db, "repositories_topics"))) {
    await db.batch(
      [
        `CREATE TABLE \`repositories_topics\` (
          \`_order\` integer NOT NULL,
          \`_parent_id\` integer NOT NULL,
          \`id\` text PRIMARY KEY NOT NULL,
          \`tag\` text NOT NULL,
          FOREIGN KEY (\`_parent_id\`) REFERENCES \`repositories\`(\`id\`) ON UPDATE no action ON DELETE cascade
        )`,
        `CREATE INDEX \`repositories_topics_order_idx\` ON \`repositories_topics\` (\`_order\`)`,
        `CREATE INDEX \`repositories_topics_parent_id_idx\` ON \`repositories_topics\` (\`_parent_id\`)`,
      ],
      "write",
    );
    console.log("Created repositories_topics");
  } else {
    console.log("repositories_topics already present");
  }

  if (await tableExists(db, "payload_locked_documents_rels")) {
    if (!(await columnExists(db, "payload_locked_documents_rels", "repositories_id"))) {
      await db.batch(
        [
          `ALTER TABLE \`payload_locked_documents_rels\`
            ADD COLUMN \`repositories_id\` integer
            REFERENCES \`repositories\`(\`id\`) ON UPDATE no action ON DELETE cascade`,
          `CREATE INDEX \`payload_locked_documents_rels_repositories_id_idx\`
            ON \`payload_locked_documents_rels\` (\`repositories_id\`)`,
        ],
        "write",
      );
      console.log("Added payload_locked_documents_rels.repositories_id");
    } else {
      console.log("payload_locked_documents_rels.repositories_id already present");
    }
  }

  // Preferentials / versions / prefs tables sometimes get auto-created by Payload;
  // ensure preferences path exists for the new collection slug if needed — skip.

  db.close();
}

await migrateRepositories();
