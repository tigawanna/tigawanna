import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    contact: text("contact"),
    message: text("message").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    telegramSent: integer("telegram_sent", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("contact_messages_created_at_idx").on(table.createdAt)],
);

export const featuredProjects = sqliteTable(
  "featured_projects",
  {
    id: text("id").primaryKey(),
    repoName: text("repo_name").notNull().unique(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("featured_projects_sort_order_idx").on(table.sortOrder)],
);

export type ContactMessageRow = typeof contactMessages.$inferSelect;
export type FeaturedProjectRow = typeof featuredProjects.$inferSelect;
