import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const journalEntryTypeValues = ["TIL", "til", "note", "CHALLENGE"] as const;

export type JournalEntryType = (typeof journalEntryTypeValues)[number];

export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    markdown: text("markdown").notNull().default(""),
    richtext: text("richtext").notNull().default(""),
    gist: text("gist"),
    type: text("type").notNull().$type<JournalEntryType>().default("TIL"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    pinOrder: integer("pin_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("journal_entries_pinned_pin_order_idx").on(table.pinned, table.pinOrder),
    index("journal_entries_created_at_idx").on(table.createdAt),
  ],
);

export type JournalEntryRow = typeof journalEntries.$inferSelect;
export type JournalEntryInsert = typeof journalEntries.$inferInsert;
