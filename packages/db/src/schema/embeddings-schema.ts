import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projectEmbeddings = sqliteTable(
  "project_embeddings",
  {
    githubRepoId: text("github_repo_id").primaryKey(),
    repoFullName: text("repo_full_name").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    topics: text("topics").notNull().default("[]"),
    embedText: text("embed_text").notNull(),
    embedding: text("embedding").notNull(),
    modelId: text("model_id").notNull().default("embeddinggemma-300m"),
    embeddedAt: integer("embedded_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("project_embeddings_repo_full_name_idx").on(table.repoFullName),
    index("project_embeddings_embedded_at_idx").on(table.embeddedAt),
  ],
);

export type ProjectEmbeddingRow = typeof projectEmbeddings.$inferSelect;
