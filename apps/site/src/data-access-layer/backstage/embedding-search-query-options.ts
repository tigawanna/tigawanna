import {
  getProjectEmbeddingSearchStats,
  searchProjectEmbeddingsByVector,
} from "@/modules/backstage/embedding-search.functions";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { mutationOptions, queryOptions } from "@tanstack/react-query";

export const projectEmbeddingSearchStatsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "embedding-search", "stats"],
  queryFn: () => getProjectEmbeddingSearchStats(),
});

export type SearchProjectEmbeddingsByVectorInput = {
  queryEmbedding: number[];
  query?: string;
  limit?: number;
};

export const searchProjectEmbeddingsByVectorMutationOptions = mutationOptions<
  Awaited<ReturnType<typeof searchProjectEmbeddingsByVector>>,
  unknown,
  SearchProjectEmbeddingsByVectorInput
>({
  mutationFn: (input: SearchProjectEmbeddingsByVectorInput) =>
    searchProjectEmbeddingsByVector({
      data: {
        queryEmbedding: input.queryEmbedding,
        query: input.query,
        limit: input.limit ?? 10,
      },
    }),
});
