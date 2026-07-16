import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "@/modules/journal/journal-form-schema";
import type { JournalEntryRow, PaginatedResponse } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createJournalEntry as createJournalEntryImpl,
  deleteJournalEntry as deleteJournalEntryImpl,
  getJournalEntryForBackstage as getJournalEntryForBackstageImpl,
  listJournalEntriesForBackstage as listJournalEntriesForBackstageImpl,
  setJournalEntryPinned as setJournalEntryPinnedImpl,
  updateJournalEntry as updateJournalEntryImpl,
} from "@/modules/journal/journal.server";

const listJournalEntriesInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
    q: z.string().optional(),
  })
  .optional();

export const listJournalEntriesForBackstage = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listJournalEntriesInputSchema>) =>
    listJournalEntriesInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<JournalEntryRow>> => {
    await requireBackstageSession();
    return listJournalEntriesForBackstageImpl(data);
  });

const journalEntryIdSchema = z.object({
  id: z.string().min(1),
});

export const getJournalEntryForBackstage = createServerFn({ method: "GET" })
  .validator((input: z.infer<typeof journalEntryIdSchema>) => journalEntryIdSchema.parse(input))
  .handler(async ({ data }): Promise<JournalEntryRow | null> => {
    await requireBackstageSession();
    return getJournalEntryForBackstageImpl(data.id);
  });

export const createJournalEntry = createServerFn({ method: "POST" })
  .validator((input: JournalEntryFormValues) => journalEntryFormSchema.parse(input))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return createJournalEntryImpl({
      ...data,
      gist: data.gist.trim() || null,
    });
  });

export const updateJournalEntry = createServerFn({ method: "POST" })
  .validator((input: JournalEntryFormValues & { id: string }) =>
    journalEntryIdSchema.extend(journalEntryFormSchema.shape).parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return updateJournalEntryImpl({
      ...data,
      gist: data.gist.trim() || null,
    });
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof journalEntryIdSchema>) => journalEntryIdSchema.parse(input))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return deleteJournalEntryImpl(data.id);
  });

export const setJournalEntryPinned = createServerFn({ method: "POST" })
  .validator((input: { id: string; pinned: boolean }) =>
    journalEntryIdSchema.extend({ pinned: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return setJournalEntryPinnedImpl(data.id, data.pinned);
  });
