import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchOpenRouterModels } from "@/services/openrouter/openrouter.api";

export const openRouterModelsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.openrouter, "models"],
  queryFn: fetchOpenRouterModels,
  staleTime: Infinity,
  gcTime: 24 * 60 * 60 * 1000,
  retry: 2,
});

export function useOpenRouterModels() {
  return useQuery(openRouterModelsQueryOptions);
}
