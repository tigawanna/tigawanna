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
 * Returns whether a column exists on a SQLite table.
 */
function columnExists(db: DatabaseSync, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

/**
 * Adds `devto_article_id` for stable Dev.to Sync / Update.
 * Safe to re-run. Local `file:` SQLite only (`push: false` in payload config).
 */
function migrateAddDevtoArticleId() {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";
  if (databaseUrl.startsWith("libsql://")) {
    throw new Error(
      "Local file: SQLite only — add devto_article_id on Turso via drizzle migrate/push.",
    );
  }

  const db = new DatabaseSync(resolveSqlitePath(databaseUrl));

  if (!columnExists(db, "blogs", "devto_article_id")) {
    db.exec(`ALTER TABLE blogs ADD COLUMN devto_article_id NUMERIC;`);
    console.log("Added blogs.devto_article_id");
  } else {
    console.log("blogs.devto_article_id already present");
  }

  if (!columnExists(db, "_blogs_v", "version_devto_article_id")) {
    db.exec(`ALTER TABLE _blogs_v ADD COLUMN version_devto_article_id NUMERIC;`);
    console.log("Added _blogs_v.version_devto_article_id");
  } else {
    console.log("_blogs_v.version_devto_article_id already present");
  }

  db.close();
}

migrateAddDevtoArticleId();
