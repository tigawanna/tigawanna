import { cosineSimilarity, keywordScore } from "@/lib/embeddings/similarity";
import { createEmbedding, hasEmbeddingProvider } from "@/lib/embeddings/provider";
import {
  embeddingRowToSearchSource,
  listRepoEmbeddings,
} from "@/lib/portfolio/repo-embeddings-store";
import type { RepoSearchResult } from "@/types/portfolio-search";
import { z } from "zod";

export const portfolioSearchInputSchema = z.object({
  query: z.string().trim().min(2).max(500),
  limit: z.number().int().min(1).max(24).optional(),
  apiKey: z.string().trim().min(1).optional(),
});

const MIN_SEMANTIC_SCORE = 0.28;
const MIN_KEYWORD_SCORE = 0.2;

function rankKeywordResults(
  query: string,
  rows: ReturnType<typeof embeddingRowToSearchSource>[],
  limit: number,
) {
  return rows
    .map((row) => ({
      nameWithOwner: row.nameWithOwner,
      name: row.name,
      description: row.description,
      tags: row.tags,
      url: row.url,
      homepageUrl: row.homepageUrl,
      openGraphImageUrl: row.openGraphImageUrl,
      pushedAt: row.pushedAt,
      isPrivate: row.isPrivate,
      score: keywordScore(query, row.searchText),
      matchType: "keyword" as const,
    }))
    .filter((result) => result.score >= MIN_KEYWORD_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

async function rankSemanticResults(
  query: string,
  rows: ReturnType<typeof embeddingRowToSearchSource>[],
  limit: number,
  apiKey?: string,
) {
  const queryEmbedding = await createEmbedding(query, { apiKey });

  return rows
    .map((row) => ({
      nameWithOwner: row.nameWithOwner,
      name: row.name,
      description: row.description,
      tags: row.tags,
      url: row.url,
      homepageUrl: row.homepageUrl,
      openGraphImageUrl: row.openGraphImageUrl,
      pushedAt: row.pushedAt,
      isPrivate: row.isPrivate,
      score: cosineSimilarity(queryEmbedding, row.embedding),
      matchType: "semantic" as const,
    }))
    .filter((result) => result.score >= MIN_SEMANTIC_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export async function searchPortfolioReposInternal(
  input: z.infer<typeof portfolioSearchInputSchema>,
) {
  const limit = input.limit ?? 12;
  const rows = (await listRepoEmbeddings()).map(embeddingRowToSearchSource);

  if (rows.length === 0) {
    return {
      query: input.query,
      results: [] as RepoSearchResult[],
      mode: "empty-index" as const,
    };
  }

  if (hasEmbeddingProvider({ apiKey: input.apiKey })) {
    const results = await rankSemanticResults(input.query, rows, limit, input.apiKey);
    return {
      query: input.query,
      results,
      mode: "semantic" as const,
    };
  }

  const results = rankKeywordResults(input.query, rows, limit);
  return {
    query: input.query,
    results,
    mode: "keyword" as const,
  };
}
