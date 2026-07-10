import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { getDb } from "@/lib/db/get-db";
import { EMBEDDING_MODEL_ID } from "@repo/gemma-embedding/constants";
import { count, projectEmbeddings } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rankEmbeddingSearchResults } from "./embedding-vector-search";

const searchByVectorInputSchema = z.object({
  queryEmbedding: z.array(z.number()).min(1),
  query: z.string().trim().optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

/**
 * Returns how many projects are indexed for vector search.
 */
export const getProjectEmbeddingSearchStats = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireBackstageSession();
    const db = getDb();
    const [result] = await db.select({ count: count() }).from(projectEmbeddings);

    return {
      indexedCount: result?.count ?? 0,
      modelId: EMBEDDING_MODEL_ID,
      dimensions: 768,
    };
  },
);

/**
 * Searches `project_embeddings` using a client-computed query vector.
 */
export const searchProjectEmbeddingsByVector = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof searchByVectorInputSchema>) =>
    searchByVectorInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();

    const rows = await db
      .select({
        githubRepoId: projectEmbeddings.githubRepoId,
        repoFullName: projectEmbeddings.repoFullName,
        name: projectEmbeddings.name,
        description: projectEmbeddings.description,
        topics: projectEmbeddings.topics,
        embedText: projectEmbeddings.embedText,
        embedding: projectEmbeddings.embedding,
        sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
      })
      .from(projectEmbeddings);

    const results = rankEmbeddingSearchResults(data.queryEmbedding, rows, data.limit);

    return {
      query: data.query ?? null,
      results,
    };
  });
