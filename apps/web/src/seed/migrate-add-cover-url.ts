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
 * Adds `cover_url` / `version_cover_url` for remote Dev.to covers.
 * Safe to re-run. Local `file:` SQLite only (`push: false` in payload config).
 */
function migrateAddCoverUrl() {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";
  if (databaseUrl.startsWith("libsql://")) {
    throw new Error("Local file: SQLite only — add cover_url on Turso via drizzle migrate/push.");
  }

  const db = new DatabaseSync(resolveSqlitePath(databaseUrl));

  if (!columnExists(db, "blogs", "cover_url")) {
    db.exec(`ALTER TABLE blogs ADD COLUMN cover_url TEXT;`);
    console.log("Added blogs.cover_url");
  } else {
    console.log("blogs.cover_url already present");
  }

  if (!columnExists(db, "_blogs_v", "version_cover_url")) {
    db.exec(`ALTER TABLE _blogs_v ADD COLUMN version_cover_url TEXT;`);
    console.log("Added _blogs_v.version_cover_url");
  } else {
    console.log("_blogs_v.version_cover_url already present");
  }

  db.close();
}

migrateAddCoverUrl();
