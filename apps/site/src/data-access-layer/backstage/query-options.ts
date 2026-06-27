import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listContactMessages } from "@/modules/backstage/contact-messages.functions";
import { queryOptions } from "@tanstack/react-query";

export const contactMessagesQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "contact-messages"],
  queryFn: () => listContactMessages(),
});
