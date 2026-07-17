import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listContactMessages } from "@/modules/backstage/contact-messages.functions";
import { getBackstageDashboardCounts } from "@/modules/backstage/dashboard.functions";
import {
  listJournalEntriesForBackstage,
  getJournalEntryForBackstage,
} from "@/modules/journal/journal.functions";
import { queryOptions } from "@tanstack/react-query";

/** Default page size for backstage offset list UIs. */
export const BACKSTAGE_LIST_PER_PAGE = 20;

export const backstageDashboardCountsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "dashboard-counts"],
  queryFn: () => getBackstageDashboardCounts(),
});

/**
 * Contact messages for a given page.
 *
 * @param page - 1-based page index (default 1).
 * @param perPage - Page size (default {@link BACKSTAGE_LIST_PER_PAGE}).
 * @param q - Optional search against name, contact, and message.
 */
export function contactMessagesQueryOptions({
  page = 1,
  perPage = BACKSTAGE_LIST_PER_PAGE,
  q = "",
}: { page?: number; perPage?: number; q?: string } = {}) {
  const query = q.trim();
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "contact-messages", page, perPage, query],
    queryFn: () =>
      listContactMessages({
        data: { page, perPage, q: query || undefined },
      }),
  });
}

/**
 * Journal entries for a given page.
 *
 * @param page - 1-based page index (default 1).
 * @param perPage - Page size (default {@link BACKSTAGE_LIST_PER_PAGE}).
 * @param q - Optional search against title and description.
 */
export function journalEntriesQueryOptions({
  page = 1,
  perPage = BACKSTAGE_LIST_PER_PAGE,
  q = "",
}: { page?: number; perPage?: number; q?: string } = {}) {
  const query = q.trim();
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "journal-entries", page, perPage, query],
    queryFn: () =>
      listJournalEntriesForBackstage({
        data: { page, perPage, q: query || undefined },
      }),
  });
}

/**
 * Single journal entry for backstage edit flows.
 *
 * @param id - Journal entry id.
 */
export function journalEntryByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "journal-entry", id],
    queryFn: () => getJournalEntryForBackstage({ data: { id } }),
  });
}
