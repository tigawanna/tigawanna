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
function tableExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare(`SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?`)
    .get(name) as { ok: number } | undefined;
  return Boolean(row);
}

/**
 * One-time migration: rename legacy `journals*` tables to `blogs*` and map
 * `kind: til` → `kind: journal`. Safe to re-run (no-ops when already migrated).
 *
 * Stop the Next/Payload dev server first, then from `apps/web` (see SCRIPTS.md):
 *   node --experimental-strip-types ./src/seed/migrate-journals-to-blogs.ts
 */
function migrateJournalsToBlogs() {
  const databaseUrl = process.env.DATABASE_URL || "file:./payload.db";
  if (databaseUrl.startsWith("libsql://")) {
    throw new Error(
      "This migration script currently supports local file: SQLite only. Export/import remote Turso manually.",
    );
  }

  const dbPath = resolveSqlitePath(databaseUrl);
  const db = new DatabaseSync(dbPath);

  const hasJournals = tableExists(db, "journals");
  const hasBlogs = tableExists(db, "blogs");

  if (!hasJournals && hasBlogs) {
    console.log("Already migrated (blogs table present, no journals). Remapping kind values…");
    db.exec(`
      UPDATE blogs SET kind = 'journal' WHERE kind = 'til' OR kind IS NULL OR kind = '';
      UPDATE _blogs_v SET version_kind = 'journal'
        WHERE version_kind = 'til' OR version_kind IS NULL OR version_kind = '';
    `);
    db.close();
    console.log("Done.");
    return;
  }

  if (!hasJournals) {
    console.log(
      "No legacy journals table and no blogs table — start the app once to push schema, then seed.",
    );
    db.close();
    return;
  }

  if (hasBlogs) {
    throw new Error(
      "Both journals and blogs tables exist. Resolve manually before re-running this migration.",
    );
  }

  console.log("Renaming journals → blogs (including version/tag tables)…");
  db.exec(`
    ALTER TABLE journals RENAME TO blogs;
    ALTER TABLE journals_tags RENAME TO blogs_tags;
    ALTER TABLE _journals_v RENAME TO _blogs_v;
    ALTER TABLE _journals_v_version_tags RENAME TO _blogs_v_version_tags;

    UPDATE blogs SET kind = 'journal' WHERE kind = 'til' OR kind IS NULL OR kind = '';
    UPDATE _blogs_v SET version_kind = 'journal'
      WHERE version_kind = 'til' OR version_kind IS NULL OR version_kind = '';
  `);

  // Rel / index names still say journals_* after table rename — align with blogs.
  const hasJournalsIdCol = (
    db.prepare(`PRAGMA table_info(payload_locked_documents_rels)`).all() as Array<{
      name: string;
    }>
  ).some((col) => col.name === "journals_id");

  if (hasJournalsIdCol) {
    db.exec(`
      ALTER TABLE payload_locked_documents_rels RENAME COLUMN journals_id TO blogs_id;
      DROP INDEX IF EXISTS payload_locked_documents_rels_journals_id_idx;
      CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_blogs_id_idx
        ON payload_locked_documents_rels (blogs_id);
    `);
  }

  db.exec(`
    DROP INDEX IF EXISTS journals_tags_order_idx;
    DROP INDEX IF EXISTS journals_tags_parent_id_idx;
    CREATE INDEX IF NOT EXISTS blogs_tags_order_idx ON blogs_tags (_order);
    CREATE INDEX IF NOT EXISTS blogs_tags_parent_id_idx ON blogs_tags (_parent_id);

    DROP INDEX IF EXISTS journals_hero_image_idx;
    DROP INDEX IF EXISTS journals_slug_idx;
    DROP INDEX IF EXISTS journals_updated_at_idx;
    DROP INDEX IF EXISTS journals_created_at_idx;
    DROP INDEX IF EXISTS journals__status_idx;
    CREATE INDEX IF NOT EXISTS blogs_hero_image_idx ON blogs (hero_image_id);
    CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_idx ON blogs (slug);
    CREATE INDEX IF NOT EXISTS blogs_updated_at_idx ON blogs (updated_at);
    CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs (created_at);
    CREATE INDEX IF NOT EXISTS blogs__status_idx ON blogs (_status);

    DROP INDEX IF EXISTS _journals_v_version_tags_order_idx;
    DROP INDEX IF EXISTS _journals_v_version_tags_parent_id_idx;
    CREATE INDEX IF NOT EXISTS _blogs_v_version_tags_order_idx ON _blogs_v_version_tags (_order);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_tags_parent_id_idx ON _blogs_v_version_tags (_parent_id);

    DROP INDEX IF EXISTS _journals_v_parent_idx;
    DROP INDEX IF EXISTS _journals_v_version_version_hero_image_idx;
    DROP INDEX IF EXISTS _journals_v_version_version_slug_idx;
    DROP INDEX IF EXISTS _journals_v_version_version_updated_at_idx;
    DROP INDEX IF EXISTS _journals_v_version_version_created_at_idx;
    DROP INDEX IF EXISTS _journals_v_version_version__status_idx;
    DROP INDEX IF EXISTS _journals_v_created_at_idx;
    DROP INDEX IF EXISTS _journals_v_updated_at_idx;
    DROP INDEX IF EXISTS _journals_v_latest_idx;
    DROP INDEX IF EXISTS _journals_v_autosave_idx;
    CREATE INDEX IF NOT EXISTS _blogs_v_parent_idx ON _blogs_v (parent_id);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_version_hero_image_idx ON _blogs_v (version_hero_image_id);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_version_slug_idx ON _blogs_v (version_slug);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_version_updated_at_idx ON _blogs_v (version_updated_at);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_version_created_at_idx ON _blogs_v (version_created_at);
    CREATE INDEX IF NOT EXISTS _blogs_v_version_version__status_idx ON _blogs_v (version__status);
    CREATE INDEX IF NOT EXISTS _blogs_v_created_at_idx ON _blogs_v (created_at);
    CREATE INDEX IF NOT EXISTS _blogs_v_updated_at_idx ON _blogs_v (updated_at);
    CREATE INDEX IF NOT EXISTS _blogs_v_latest_idx ON _blogs_v (latest);
    CREATE INDEX IF NOT EXISTS _blogs_v_autosave_idx ON _blogs_v (autosave);
  `);

  const counts = db
    .prepare(`SELECT kind, COUNT(*) AS n FROM blogs GROUP BY kind ORDER BY kind`)
    .all() as Array<{ kind: string; n: number }>;

  db.close();

  console.log("Migration complete:");
  for (const row of counts) {
    console.log(`  ${row.kind}: ${row.n}`);
  }
  console.log("Restart the Next.js app so Payload can sync any remaining schema diffs.");
}

migrateJournalsToBlogs();
