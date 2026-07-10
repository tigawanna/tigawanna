export type SourceEmbeddingChunk = {
  kind: string;
  label: string;
  text: string;
  embedding: number[];
};

export type EmbeddingSearchRow = {
  githubRepoId: string;
  repoFullName: string;
  name: string;
  description: string | null;
  topics: string;
  embedText: string;
  embedding: string;
  sourceEmbeddings: string;
};

export type EmbeddingSearchHit = {
  githubRepoId: string;
  repoFullName: string;
  name: string;
  description: string | null;
  topics: string[];
  embedText: string;
  similarity: number;
};

/**
 * Cosine similarity between two vectors (-1 to 1).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) {
    return 0;
  }

  return dot / denom;
}

/**
 * Parses a JSON topic list from `project_embeddings.topics`.
 */
export function parseEmbeddingTopics(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((topic): topic is string => typeof topic === "string");
  } catch {
    return [];
  }
}

/**
 * Parses a stored summary embedding vector.
 */
export function parseStoredEmbedding(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid embedding payload");
  }

  return parsed.map((value) => {
    if (typeof value !== "number") {
      throw new Error("Invalid embedding value");
    }
    return value;
  });
}

function parseSourceEmbeddings(raw: string | null | undefined): SourceEmbeddingChunk[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (
        typeof entry !== "object" ||
        entry == null ||
        !Array.isArray((entry as SourceEmbeddingChunk).embedding)
      ) {
        return [];
      }

      return [entry as SourceEmbeddingChunk];
    });
  } catch {
    return [];
  }
}

function bestSimilarity(queryVector: number[], embedding: string, sourceEmbeddings: string) {
  const chunks = parseSourceEmbeddings(sourceEmbeddings);
  const vectors =
    chunks.length > 0
      ? chunks.map((chunk) => chunk.embedding).filter((vector) => vector.length > 0)
      : [parseStoredEmbedding(embedding)];

  return Math.max(...vectors.map((vector) => cosineSimilarity(queryVector, vector)));
}

/**
 * Ranks indexed projects by cosine similarity to a query vector.
 */
export function rankEmbeddingSearchResults(
  queryVector: number[],
  rows: EmbeddingSearchRow[],
  limit: number,
): EmbeddingSearchHit[] {
  return rows
    .map((row) => ({
      githubRepoId: row.githubRepoId,
      repoFullName: row.repoFullName,
      name: row.name,
      description: row.description,
      topics: parseEmbeddingTopics(row.topics),
      embedText: row.embedText,
      similarity: bestSimilarity(queryVector, row.embedding, row.sourceEmbeddings),
    }))
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}
