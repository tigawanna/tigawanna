import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listContactMessages } from "@/modules/backstage/contact-messages.functions";
import { getBackstageDashboardCounts } from "@/modules/backstage/dashboard.functions";
import { listJournalEntriesForBackstage } from "@/modules/journal/journal.functions";
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
 */
export function contactMessagesQueryOptions(page = 1, perPage = BACKSTAGE_LIST_PER_PAGE) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "contact-messages", page, perPage],
    queryFn: () => listContactMessages({ data: { page, perPage } }),
  });
}

/**
 * Journal entries for a given page.
 *
 * @param {number} page - 1-based page index (default 1).
 * @param {number} perPage - Page size (default {@link BACKSTAGE_LIST_PER_PAGE}).
 */
export function journalEntriesQueryOptions({
  page = 1,
  perPage = BACKSTAGE_LIST_PER_PAGE,
}: { page?: number; perPage?: number } = {}) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "journal-entries", page, perPage],
    queryFn: () => listJournalEntriesForBackstage({ data: { page, perPage } }),
  });
}
