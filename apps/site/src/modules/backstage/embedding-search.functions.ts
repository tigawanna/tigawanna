import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { getDb } from "@/lib/db/get-db";
import { EMBEDDING_MODEL_ID } from "@repo/gemma-embedding/constants";
import { count, projectEmbeddings, sql } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const searchByVectorInputSchema = z.object({
  queryEmbedding: z.array(z.number()).min(1),
  query: z.string().trim().optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export type EmbeddingVectorSearchRow = {
  githubRepoId: string;
  repoFullName: string;
  name: string;
  description: string | null;
  topics: string;
  embedText: string;
  embedding: string;
  sourceEmbeddings: string;
  distance: number;
};

export type EmbeddingVectorSearchResponse = {
  query: string | null;
  results: EmbeddingVectorSearchRow[];
};

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
 * Turso vector helpers live at the column / expression level (same idea as SpatiaLite).
 *
 * Note: `vector(embedding)` must use a bare column name — drizzle column refs inside
 * `vector()` become a quoted identifier literal, not a column read.
 * Skip rows with empty/invalid embeddings (e.g. `[]`) — they crash vector_distance_cos.
 */
export const searchProjectEmbeddingsByVector = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof searchByVectorInputSchema>) =>
    searchByVectorInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const db = getDb();

    const queryVectorJson = JSON.stringify(data.queryEmbedding);

    const results = await db
      .select({
        githubRepoId: projectEmbeddings.githubRepoId,
        repoFullName: projectEmbeddings.repoFullName,
        name: projectEmbeddings.name,
        description: projectEmbeddings.description,
        topics: projectEmbeddings.topics,
        embedText: projectEmbeddings.embedText,
        embedding: projectEmbeddings.embedding,
        sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
        distance:
          sql<number>`vector_distance_cos(vector(embedding), vector(${queryVectorJson}))`.as(
            "distance",
          ),
      })
      .from(projectEmbeddings)
      .where(sql`json_array_length(embedding) = 768`)
      .orderBy(sql`distance ASC`)
      .limit(data.limit);

    return {
      query: data.query ?? null,
      results,
    } satisfies EmbeddingVectorSearchResponse;
  });
