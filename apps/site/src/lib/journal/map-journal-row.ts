import type { JournalEntryRow } from "@repo/db";
import type { LessonItem } from "@/types/lessons";

const COLLECTION_NAME = "portfolio_milestones";

export function journalRowToLessonItem(row: JournalEntryRow): LessonItem {
  return {
    id: row.id,
    collectionId: COLLECTION_NAME,
    collectionName: COLLECTION_NAME,
    created: row.createdAt.toISOString(),
    updated: row.updatedAt.toISOString(),
    title: row.title,
    description: row.description,
    markdown: row.markdown,
    richtext: row.richtext,
    type: row.type,
    gist: row.gist ?? undefined,
  };
}

export function compareJournalEntriesForDisplay(
  a: Pick<JournalEntryRow, "pinned" | "pinOrder" | "createdAt">,
  b: Pick<JournalEntryRow, "pinned" | "pinOrder" | "createdAt">,
) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1;
  }

  if (a.pinned && b.pinned && a.pinOrder !== b.pinOrder) {
    return a.pinOrder - b.pinOrder;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
}
