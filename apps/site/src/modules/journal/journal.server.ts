import { getDb } from "@/lib/db/get-db.server";
import { journalRowToLessonItem } from "@/modules/journal/map-journal-row";
import type { LessonItem } from "@/types/lessons";
import {
  asc,
  buildPaginatedResponse,
  count,
  desc,
  eq,
  journalEntries,
  normalizePaginationParams,
  or,
  sql,
  type JournalEntryRow,
  type PaginatedResponse,
} from "@repo/db";

/**
 * Escapes `%`, `_`, and `\` so user search text is treated literally in LIKE.
 */
function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

async function nextPinOrder() {
  const db = getDb();
  const [row] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${journalEntries.pinOrder}), -1)` })
    .from(journalEntries)
    .where(eq(journalEntries.pinned, true));

  return (row?.maxOrder ?? -1) + 1;
}

export type LessonSortBy = "latest" | "oldest";

export interface FetchJournalLessonPageOptions {
  q?: string;
  sortBy?: LessonSortBy;
  /** When true, pinned entries float above time order. */
  pinnedFirst?: boolean;
}

/**
 * Builds a LIKE pattern for case-insensitive journal title/description search.
 */
function journalSearchWhere(q: string) {
  const normalized = q.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const searchPattern = `%${escapeLikePattern(normalized)}%`;
  return or(
    sql`lower(${journalEntries.title}) like ${searchPattern} escape '\\'`,
    sql`lower(${journalEntries.description}) like ${searchPattern} escape '\\'`,
  );
}

/**
 * Fetches a page of journal lessons for the public lessons index.
 *
 * @param page - 1-based page index.
 * @param perPage - Page size.
 * @param options - Optional search (`q`) and sort (`latest` | `oldest`).
 */
export async function fetchJournalLessonPage(
  page: number,
  perPage: number,
  options: FetchJournalLessonPageOptions = {},
) {
  const db = getDb();
  const {
    page: safePage,
    perPage: safePerPage,
    offset,
  } = normalizePaginationParams({
    page,
    perPage,
  });

  const searchWhere = journalSearchWhere(options.q ?? "");
  let orderByCreated = desc(journalEntries.createdAt);
  if (options.sortBy === "oldest") {
    orderByCreated = asc(journalEntries.createdAt);
  }

  const [{ count: totalItems }] = await db
    .select({ count: count() })
    .from(journalEntries)
    .where(searchWhere);

  const orderBy =
    options.pinnedFirst === true
      ? ([desc(journalEntries.pinned), asc(journalEntries.pinOrder), orderByCreated] as const)
      : ([orderByCreated] as const);

  const rows = await db
    .select()
    .from(journalEntries)
    .where(searchWhere)
    .orderBy(...orderBy)
    .limit(safePerPage)
    .offset(offset);

  const paginated = buildPaginatedResponse({
    items: rows.map(journalRowToLessonItem),
    page: safePage,
    perPage: safePerPage,
    totalItems,
  });

  return {
    page: paginated.pagination.page,
    perPage: paginated.pagination.perPage,
    totalPages: Math.max(1, paginated.pagination.totalPages),
    totalItems: paginated.pagination.totalItems,
    items: paginated.items,
  };
}

/**
 * Returns the total number of journal entries in D1 (no filters).
 */
export async function countJournalEntries() {
  const db = getDb();
  const [{ count: totalItems }] = await db.select({ count: count() }).from(journalEntries);
  return totalItems;
}

export async function fetchJournalLessonById(id: string): Promise<LessonItem | null> {
  const db = getDb();
  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  return row ? journalRowToLessonItem(row) : null;
}

export async function listJournalEntriesForBackstage(data?: {
  page?: number;
  perPage?: number;
  q?: string;
}): Promise<PaginatedResponse<JournalEntryRow>> {
  const db = getDb();
  const { page, perPage, offset } = normalizePaginationParams(data ?? {});
  const searchWhere = journalSearchWhere(data?.q ?? "");

  const [{ count: totalItems }] = await db
    .select({ count: count() })
    .from(journalEntries)
    .where(searchWhere);

  const items = await db
    .select()
    .from(journalEntries)
    .where(searchWhere)
    .orderBy(
      desc(journalEntries.pinned),
      asc(journalEntries.pinOrder),
      desc(journalEntries.createdAt),
    )
    .limit(perPage)
    .offset(offset);

  return buildPaginatedResponse({ items, page, perPage, totalItems });
}

export async function getJournalEntryForBackstage(id: string): Promise<JournalEntryRow | null> {
  const db = getDb();
  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  return row ?? null;
}

export async function createJournalEntry(data: {
  title: string;
  description: string;
  markdown: string;
  richtext: string;
  gist: string | null;
  type: JournalEntryRow["type"];
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  const gist = data.gist?.trim() || null;

  await db.insert(journalEntries).values({
    id,
    title: data.title.trim(),
    description: data.description.trim(),
    markdown: data.markdown,
    richtext: data.richtext,
    gist,
    type: data.type,
  });

  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  if (!row) {
    throw new Error("Failed to create journal entry");
  }

  return row;
}

export async function updateJournalEntry(data: {
  id: string;
  title: string;
  description: string;
  markdown: string;
  richtext: string;
  gist: string | null;
  type: JournalEntryRow["type"];
}) {
  const db = getDb();
  const gist = data.gist?.trim() || null;

  await db
    .update(journalEntries)
    .set({
      title: data.title.trim(),
      description: data.description.trim(),
      markdown: data.markdown,
      richtext: data.richtext,
      gist,
      type: data.type,
    })
    .where(eq(journalEntries.id, data.id));

  const [row] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, data.id))
    .limit(1);

  if (!row) {
    throw new Error("Journal entry not found");
  }

  return row;
}

export async function deleteJournalEntry(id: string) {
  const db = getDb();
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  return { ok: true as const };
}

export async function setJournalEntryPinned(id: string, pinned: boolean) {
  const db = getDb();

  if (pinned) {
    const pinOrder = await nextPinOrder();
    await db
      .update(journalEntries)
      .set({ pinned: true, pinOrder })
      .where(eq(journalEntries.id, id));
  } else {
    await db
      .update(journalEntries)
      .set({ pinned: false, pinOrder: 0 })
      .where(eq(journalEntries.id, id));
  }

  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);

  if (!row) {
    throw new Error("Journal entry not found");
  }

  return row;
}
