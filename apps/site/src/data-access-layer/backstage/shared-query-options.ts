import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listContactMessages } from "@/modules/backstage/contact-messages.functions";
import { listJournalEntriesForBackstage } from "@/modules/journal/journal.functions";
import { queryOptions } from "@tanstack/react-query";

export const contactMessagesQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "contact-messages"],
  queryFn: () => listContactMessages(),
});

export const journalEntriesQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "journal-entries"],
  queryFn: () => listJournalEntriesForBackstage(),
});
