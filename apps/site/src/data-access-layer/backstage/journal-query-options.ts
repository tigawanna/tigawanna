import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listJournalEntriesForBackstage } from "@/modules/journal/journal.functions";
import { queryOptions } from "@tanstack/react-query";

export const journalEntriesQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "journal-entries"],
  queryFn: () => listJournalEntriesForBackstage(),
});
