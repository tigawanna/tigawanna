import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const repoEmbeddings = sqliteTable("repo_embeddings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameWithOwner: text("name_with_owner").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  url: text("url").notNull(),
  homepageUrl: text("homepage_url"),
  openGraphImageUrl: text("open_graph_image_url"),
  pushedAt: text("pushed_at"),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  searchText: text("search_text").notNull(),
  embedding: text("embedding", { mode: "json" }).$type<number[]>().notNull(),
  embeddedAt: text("embedded_at").notNull(),
});

export type RepoEmbeddingRow = typeof repoEmbeddings.$inferSelect;
export type NewRepoEmbeddingRow = typeof repoEmbeddings.$inferInsert;
