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
 * Adds monorepo / README cache columns + `repositories_packages` array table.
 * Safe to re-run. Works for local `file:` SQLite and Turso (`libsql://`).
 */
async function migrateRepositoryMonorepo() {
  const db = createDbClient();

  if (!(await tableExists(db, "repositories"))) {
    console.log("repositories table missing — run migrate:repositories first");
    db.close();
    return;
  }

  const columns: Array<{ name: string; sql: string }> = [
    {
      name: "default_branch",
      sql: `ALTER TABLE \`repositories\` ADD COLUMN \`default_branch\` text`,
    },
    {
      name: "is_monorepo",
      sql: `ALTER TABLE \`repositories\` ADD COLUMN \`is_monorepo\` integer DEFAULT false NOT NULL`,
    },
    {
      name: "monorepo_kind",
      sql: `ALTER TABLE \`repositories\` ADD COLUMN \`monorepo_kind\` text`,
    },
    {
      name: "readme_markdown",
      sql: `ALTER TABLE \`repositories\` ADD COLUMN \`readme_markdown\` text`,
    },
  ];

  for (const column of columns) {
    if (!(await columnExists(db, "repositories", column.name))) {
      await db.execute(column.sql);
      console.log(`Added repositories.${column.name}`);
    } else {
      console.log(`repositories.${column.name} already present`);
    }
  }

  if (!(await tableExists(db, "repositories_packages"))) {
    await db.batch(
      [
        `CREATE TABLE \`repositories_packages\` (
          \`_order\` integer NOT NULL,
          \`_parent_id\` integer NOT NULL,
          \`id\` text PRIMARY KEY NOT NULL,
          \`name\` text NOT NULL,
          \`path\` text NOT NULL,
          \`kind\` text DEFAULT 'other' NOT NULL,
          \`description\` text,
          \`readme_path\` text,
          \`readme_markdown\` text,
          FOREIGN KEY (\`_parent_id\`) REFERENCES \`repositories\`(\`id\`) ON UPDATE no action ON DELETE cascade
        )`,
        `CREATE INDEX \`repositories_packages_order_idx\` ON \`repositories_packages\` (\`_order\`)`,
        `CREATE INDEX \`repositories_packages_parent_id_idx\` ON \`repositories_packages\` (\`_parent_id\`)`,
      ],
      "write",
    );
    console.log("Created repositories_packages");
  } else {
    console.log("repositories_packages already present");
  }

  db.close();
}

await migrateRepositoryMonorepo();
