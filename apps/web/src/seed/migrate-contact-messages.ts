import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Resolves the local SQLite file path from DATABASE_URL.
 */
function resolveSqlitePath(databaseUrl: string): string {
  if (databaseUrl.startsWith("file:")) {
    const raw = databaseUrl.slice("file:".length);
    return path.isAbsolute(raw) ? raw : path.resolve(dirname, "../..", raw);
  }
  return path.resolve(dirname, "../../payload.db");
}

/**
 * Returns whether a table exists in the SQLite database.
 */
function tableExists(db: DatabaseSync, table: string): boolean {
  const row = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(table) as { name?: string } | undefined;
  return Boolean(row?.name);
}

/**
 * Returns whether a column exists on a SQLite table.
 */
function columnExists(db: DatabaseSync, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

/**
 * Creates the Payload `contact-messages` collection tables + locked-doc relation column.
 * Safe to re-run. Local `file:` SQLite only (`push: false` in payload config).
 */
function migrateContactMessages() {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";
  if (databaseUrl.startsWith("libsql://")) {
    throw new Error(
      "Local file: SQLite only — add contact_messages on Turso via drizzle migrate/push.",
    );
  }

  const db = new DatabaseSync(resolveSqlitePath(databaseUrl));

  if (!tableExists(db, "contact_messages")) {
    db.exec(`
      CREATE TABLE \`contact_messages\` (
        \`id\` integer PRIMARY KEY NOT NULL,
        \`name\` text NOT NULL,
        \`contact\` text,
        \`message\` text NOT NULL,
        \`ip_address\` text,
        \`user_agent\` text,
        \`telegram_sent\` integer DEFAULT false NOT NULL,
        \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
        \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
      );
      CREATE INDEX \`contact_messages_updated_at_idx\` ON \`contact_messages\` (\`updated_at\`);
      CREATE INDEX \`contact_messages_created_at_idx\` ON \`contact_messages\` (\`created_at\`);
    `);
    console.log("Created contact_messages");
  } else {
    console.log("contact_messages already present");
  }

  if (tableExists(db, "payload_locked_documents_rels")) {
    if (!columnExists(db, "payload_locked_documents_rels", "contact_messages_id")) {
      db.exec(`
        ALTER TABLE \`payload_locked_documents_rels\`
          ADD COLUMN \`contact_messages_id\` integer
          REFERENCES \`contact_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade;
        CREATE INDEX \`payload_locked_documents_rels_contact_messages_id_idx\`
          ON \`payload_locked_documents_rels\` (\`contact_messages_id\`);
      `);
      console.log("Added payload_locked_documents_rels.contact_messages_id");
    } else {
      console.log("payload_locked_documents_rels.contact_messages_id already present");
    }
  }

  db.close();
}

migrateContactMessages();
