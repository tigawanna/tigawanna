import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "@/modules/journal/journal-form-schema";
import {
  compareJournalEntriesForDisplay,
  journalRowToLessonItem,
} from "@/modules/journal/map-journal-row";
import { getDb } from "@/lib/db/get-db";
import type { LessonItem } from "@/types/lessons";
import { eq, journalEntries, sql, type JournalEntryRow } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function sortJournalRows(rows: JournalEntryRow[]) {
  return [...rows].sort(compareJournalEntriesForDisplay);
}

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
  const rows = await db.select().from(journalEntries);
  const sorted = sortJournalRows(rows);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    page: safePage,
    perPage,
    totalPages,
    totalItems,
    items: sorted.slice(start, start + perPage).map(journalRowToLessonItem),
  };
}

export async function fetchJournalLessonById(id: string): Promise<LessonItem | null> {
  const db = getDb();
  const [row] = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  return row ? journalRowToLessonItem(row) : null;
}

export const listJournalEntriesForBackstage = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireBackstageSession();
    const db = getDb();
    const rows = await db.select().from(journalEntries);
    return sortJournalRows(rows);
  },
);

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
