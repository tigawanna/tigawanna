import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  getProjectEmbeddingStats,
  listProjectEmbeddings,
} from "@/modules/backstage/embeddings.functions";
import { queryOptions } from "@tanstack/react-query";

export const projectEmbeddingStatsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "embeddings", "stats"],
  queryFn: () => getProjectEmbeddingStats(),
});

export const projectEmbeddingsListQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "embeddings", "list"],
  queryFn: () => listProjectEmbeddings(),
});
