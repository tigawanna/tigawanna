import { sql } from "drizzle-orm";
import { createDb } from "../src/lib/drizzle/create-db";
import { syncRepoEmbeddings } from "../src/lib/portfolio/sync-repo-embeddings";
import { scriptEnv } from "./load-script-env";

async function ensureTable(db: ReturnType<typeof createDb>) {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS repo_embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_with_owner TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      tags TEXT NOT NULL,
      url TEXT NOT NULL,
      homepage_url TEXT,
      open_graph_image_url TEXT,
      pushed_at TEXT,
      is_private INTEGER NOT NULL DEFAULT 0,
      search_text TEXT NOT NULL,
      embedding TEXT NOT NULL,
      embedded_at TEXT NOT NULL
    )
  `);
}

async function main() {
  const db = createDb({
    url: scriptEnv.DATABASE_URL,
    authToken: scriptEnv.DATABASE_AUTH_TOKEN,
  });

  await ensureTable(db);

  const result = await syncRepoEmbeddings();

  console.log(
    JSON.stringify(
      {
        ok: true,
        indexed: result.indexed,
        totalInDatabase: result.totalInDatabase,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
