import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "@/modules/journal/journal-form-schema";
import { journalRowToLessonItem } from "@/modules/journal/map-journal-row";
import { getDb } from "@/lib/db/get-db";
import type { LessonItem } from "@/types/lessons";
import {
  asc,
  buildPaginatedResponse,
  count,
  desc,
  eq,
  journalEntries,
  normalizePaginationParams,
  sql,
  type JournalEntryRow,
  type PaginatedResponse,
} from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function nextPinOrder() {
  const db = getDb();
  const [row] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${journalEntries.pinOrder}), -1)` })
    .from(journalEntries)
    .where(eq(journalEntries.pinned, true));

  return (row?.maxOrder ?? -1) + 1;
}

export async function fetchJournalLessonPage(page: number, perPage: number) {
  const db = getDb();
  const {
    page: safePage,
    perPage: safePerPage,
    offset,
  } = normalizePaginationParams({
    page,
    perPage,
  });

  const [{ count: totalItems }] = await db.select({ count: count() }).from(journalEntries);

  const rows = await db
    .select()
    .from(journalEntries)
    .orderBy(
      desc(journalEntries.pinned),
      asc(journalEntries.pinOrder),
      desc(journalEntries.createdAt),
    )
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

export async function fetchJournalLessonById(id: string): Promise<LessonItem | null> {
  const db = getDb();
  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  return row ? journalRowToLessonItem(row) : null;
}

const listJournalEntriesInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
  })
  .optional();

/**
 * Lists journal entries for backstage, paginated.
 *
 * Rows are returned as-is from Drizzle, ordered for site display
 * (pinned first, then pin order, then newest).
 */
export const listJournalEntriesForBackstage = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listJournalEntriesInputSchema>) =>
    listJournalEntriesInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<JournalEntryRow>> => {
    await requireBackstageSession();
    const db = getDb();
    const { page, perPage, offset } = normalizePaginationParams(data ?? {});

    const [{ count: totalItems }] = await db.select({ count: count() }).from(journalEntries);

    const items = await db
      .select()
      .from(journalEntries)
      .orderBy(
        desc(journalEntries.pinned),
        asc(journalEntries.pinOrder),
        desc(journalEntries.createdAt),
      )
      .limit(perPage)
      .offset(offset);

    return buildPaginatedResponse({ items, page, perPage, totalItems });
  });

const journalEntryIdSchema = z.object({
  id: z.string().min(1),
});

export const createJournalEntry = createServerFn({ method: "POST" })
  .validator((input: JournalEntryFormValues) => journalEntryFormSchema.parse(input))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();
    const id = crypto.randomUUID();
    const gist = data.gist.trim() || null;

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
  });

export const updateJournalEntry = createServerFn({ method: "POST" })
  .validator((input: JournalEntryFormValues & { id: string }) =>
    journalEntryIdSchema.extend(journalEntryFormSchema.shape).parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();
    const gist = data.gist.trim() || null;

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
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof journalEntryIdSchema>) => journalEntryIdSchema.parse(input))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();
    await db.delete(journalEntries).where(eq(journalEntries.id, data.id));
    return { ok: true as const };
  });

export const setJournalEntryPinned = createServerFn({ method: "POST" })
  .validator((input: { id: string; pinned: boolean }) =>
    journalEntryIdSchema.extend({ pinned: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();

    if (data.pinned) {
      const pinOrder = await nextPinOrder();
      await db
        .update(journalEntries)
        .set({ pinned: true, pinOrder })
        .where(eq(journalEntries.id, data.id));
    } else {
      await db
        .update(journalEntries)
        .set({ pinned: false, pinOrder: 0 })
        .where(eq(journalEntries.id, data.id));
    }

    const [row] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, data.id))
      .limit(1);

    if (!row) {
      throw new Error("Journal entry not found");
    }

    return row;
  });
