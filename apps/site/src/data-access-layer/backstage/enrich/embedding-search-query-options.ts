import {
  getProjectEmbeddingSearchStats,
  searchProjectEmbeddingsByVector,
  type EmbeddingVectorSearchResponse,
} from "@/modules/backstage/embedding-search.functions";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const projectEmbeddingSearchStatsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "embedding-search", "stats"],
  queryFn: () => getProjectEmbeddingSearchStats(),
});

export type SearchProjectEmbeddingsByVectorInput = {
  queryEmbedding: number[];
  query?: string;
  limit?: number;
};

export type SearchProjectEmbeddingsRequest = {
  input: SearchProjectEmbeddingsByVectorInput;
  requestId: number;
};

export function searchProjectEmbeddingsByVectorQueryOptions(
  request: SearchProjectEmbeddingsRequest | null,
) {
  return queryOptions<EmbeddingVectorSearchResponse>({
    queryKey: [
      queryKeyPrefixes.backstage,
      "embedding-search",
      "vector",
      request?.requestId ?? null,
    ],
    queryFn: () =>
      searchProjectEmbeddingsByVector({
        data: {
          queryEmbedding: request!.input.queryEmbedding,
          query: request!.input.query,
          limit: request!.input.limit ?? 10,
        },
      }),
    // enabled: request != null,
  });
}
