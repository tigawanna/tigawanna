import { requireAdminSession } from "@/modules/admin-auth/require-admin";
import {
  embedDocument,
  getEmbeddingModelId,
  getGemmaEmbedding,
} from "@/modules/backstage/gemma-embedding-service";
import {
  fetchRepoExtraction,
  readmeHasDescription,
  readmeHasTags,
  summarizePackageJson,
} from "@/modules/github/repo-extraction";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
} from "@/modules/project-enrichment/github-client";
import { getDb } from "@/lib/db/get-db";
import { getServerEnv } from "@/lib/envs/server-env";
import { cosine } from "@kessler/gemma-embedding";
import { asc, count, eq, projectEmbeddings } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_INDEX_LIMIT = 100;
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_SEARCH_LIMIT = 10;

function parseTopics(raw: string) {
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

function serializeTopics(topics: string[]) {
  return JSON.stringify(topics);
}

export function buildProjectEmbedText(repo: {
  name: string;
  nameWithOwner: string;
  description: string | null;
  topics: string[];
}) {
  const parts = [
    repo.name,
    repo.nameWithOwner,
    repo.description?.trim(),
    repo.topics.length > 0 ? `Topics: ${repo.topics.join(", ")}` : null,
  ].filter((part): part is string => Boolean(part && part.length > 0));

  return parts.join(". ");
}

const projectEmbeddingListColumns = {
  githubRepoId: projectEmbeddings.githubRepoId,
  repoFullName: projectEmbeddings.repoFullName,
  repoUrl: projectEmbeddings.repoUrl,
  name: projectEmbeddings.name,
  description: projectEmbeddings.description,
  topics: projectEmbeddings.topics,
  embedText: projectEmbeddings.embedText,
  modelId: projectEmbeddings.modelId,
  embeddedAt: projectEmbeddings.embeddedAt,
};

const projectEmbeddingSearchColumns = {
  ...projectEmbeddingListColumns,
  embedding: projectEmbeddings.embedding,
  sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
};

type SourceEmbeddingChunk = {
  kind: string;
  label: string;
  text: string;
  embedding: number[];
};

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
      : [parseEmbedding(embedding)];

  return Math.max(...vectors.map((vector) => cosine(queryVector, vector)));
}

async function getIndexedProjectCount(db: ReturnType<typeof getDb>) {
  const [result] = await db.select({ count: count() }).from(projectEmbeddings);
  return result?.count ?? 0;
}

async function getIndexedProjectIds(db: ReturnType<typeof getDb>) {
  const rows = await db
    .select({ githubRepoId: projectEmbeddings.githubRepoId })
    .from(projectEmbeddings);
  return new Set(rows.map((row) => row.githubRepoId));
}

function parseEmbedding(raw: string) {
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

export const getProjectEmbeddingStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  const indexedCount = await getIndexedProjectCount(db);
  const modelId = getEmbeddingModelId();

  return {
    indexedCount,
    modelId,
    dimensions: 768,
  };
});

export const listProjectEmbeddings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();

  const rows = await db
    .select(projectEmbeddingListColumns)
    .from(projectEmbeddings)
    .orderBy(asc(projectEmbeddings.repoFullName));

  return rows.map((row) => ({
    githubRepoId: row.githubRepoId,
    repoFullName: row.repoFullName,
    name: row.name,
    description: row.description,
    topics: parseTopics(row.topics),
    embedText: row.embedText,
    modelId: row.modelId,
    embeddedAt: row.embeddedAt,
  }));
});

const indexBatchInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(DEFAULT_INDEX_LIMIT),
  batchSize: z.number().int().min(1).max(10).default(DEFAULT_BATCH_SIZE),
  force: z.boolean().optional(),
});

export const indexProjectEmbeddingsBatch = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof indexBatchInputSchema>) => indexBatchInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();

    const env = getServerEnv();
    const pat = env.GH_PAT;
    if (!pat) {
      throw new Error("GH_PAT is not configured");
    }

    const db = getDb();
    const indexedCount = await getIndexedProjectCount(db);
    const existingIds = await getIndexedProjectIds(db);

    const githubRepos = await fetchRecentRepos(pat, data.limit);
    const candidates = githubRepos.filter((repo) => data.force || !existingIds.has(repo.id));

    if (candidates.length === 0) {
      return {
        processed: [] as string[],
        remaining: 0,
        totalCandidates: 0,
        indexedCount,
      };
    }

    const batch = candidates.slice(0, data.batchSize);
    const embedding = await getGemmaEmbedding();
    const modelId = getEmbeddingModelId();
    const now = new Date();
    const processed: string[] = [];

    console.log(
      `[embeddings] starting batch of ${batch.length} (${candidates.length} candidates, ${indexedCount} already indexed)`,
    );

    for (const repo of batch) {
      const embedText = buildProjectEmbedText(repo);

      try {
        const vector = await embedding.embed(embedText, "document");

        await db
          .insert(projectEmbeddings)
          .values({
            githubRepoId: repo.id,
            repoFullName: repo.nameWithOwner,
            repoUrl: `https://github.com/${repo.nameWithOwner}`,
            name: repo.name,
            description: repo.description,
            topics: serializeTopics(repo.topics),
            embedText,
            embedding: JSON.stringify(vector),
            sourceEmbeddings: JSON.stringify([
              {
                kind: "summary",
                label: "summary",
                text: embedText,
                embedding: vector,
              },
            ]),
            modelId,
            embeddedAt: now,
          })
          .onConflictDoUpdate({
            target: projectEmbeddings.githubRepoId,
            set: {
              repoFullName: repo.nameWithOwner,
              repoUrl: `https://github.com/${repo.nameWithOwner}`,
              name: repo.name,
              description: repo.description,
              topics: serializeTopics(repo.topics),
              embedText,
              embedding: JSON.stringify(vector),
              sourceEmbeddings: JSON.stringify([
                {
                  kind: "summary",
                  label: "summary",
                  text: embedText,
                  embedding: vector,
                },
              ]),
              modelId,
              embeddedAt: now,
            },
          });

        processed.push(repo.nameWithOwner);
        console.log(
          `[embeddings] success ${repo.nameWithOwner} (${vector.length} dimensions, ${embedText.length} chars)`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[embeddings] error ${repo.nameWithOwner}: ${message}`);
      }
    }

    const remaining = Math.max(candidates.length - batch.length, 0);

    console.log(
      `[embeddings] batch finished: ${processed.length} succeeded, ${batch.length - processed.length} failed, ${remaining} remaining`,
    );

    const finalIndexedCount = await getIndexedProjectCount(db);

    return {
      processed,
      remaining,
      totalCandidates: candidates.length,
      indexedCount: finalIndexedCount,
    };
  });

const searchInputSchema = z.object({
  query: z.string().trim().min(1),
  limit: z.number().int().min(1).max(20).default(DEFAULT_SEARCH_LIMIT),
});

export const searchProjectEmbeddings = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof searchInputSchema>) => searchInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();

    const db = getDb();
    const rows = await db.select(projectEmbeddingSearchColumns).from(projectEmbeddings);

    if (rows.length === 0) {
      return { query: data.query, results: [] };
    }

    const embedding = await getGemmaEmbedding();
    const queryVector = await embedding.embed(data.query, "query");

    const results = rows
      .map((row) => {
        return {
          githubRepoId: row.githubRepoId,
          repoFullName: row.repoFullName,
          name: row.name,
          description: row.description,
          topics: parseTopics(row.topics),
          embedText: row.embedText,
          similarity: bestSimilarity(queryVector, row.embedding, row.sourceEmbeddings),
        };
      })
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, data.limit);

    return { query: data.query, results };
  });

export const clearProjectEmbeddings = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  await db.delete(projectEmbeddings);
  return { ok: true };
});

export const warmEmbeddingModel = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdminSession();
  const embedding = await getGemmaEmbedding();
  return {
    loaded: embedding.isLoaded(),
    modelId: getEmbeddingModelId(),
    dimensions: embedding.dimensions,
  };
});

const indexSingleInputSchema = z.object({
  repoFullName: z.string().regex(/^[^/]+\/[^/]+$/),
  skipIfComplete: z.boolean().optional(),
  force: z.boolean().optional(),
});

function shouldSkipEmbedding(input: {
  force: boolean;
  skipIfComplete: boolean;
  repo: { description: string | null; topics: string[] };
  stored: {
    sourceEmbeddings: SourceEmbeddingChunk[];
    inferredDescription: string | null;
    inferredTopics: string | null;
    topics: string;
  } | null;
  extraction: { readme: string | null };
}) {
  if (input.force || !input.skipIfComplete || !input.stored) {
    return null;
  }

  if (input.stored.sourceEmbeddings.length === 0) {
    return null;
  }

  const readme = input.extraction.readme ?? "";
  const description =
    input.repo.description?.trim() ||
    input.stored.inferredDescription?.trim() ||
    (readme && readmeHasDescription(readme) ? "readme-description" : "");
  const topics =
    input.repo.topics.length > 0
      ? input.repo.topics
      : input.stored.inferredTopics
        ? parseTopics(input.stored.inferredTopics)
        : readme && readmeHasTags(readme)
          ? ["readme-tags"]
          : parseTopics(input.stored.topics);

  if (description.length > 0 && topics.length > 0) {
    return "Embeddings, description, and tags already present";
  }

  return null;
}

/**
 * Indexes one repository with multi-source Gemma embeddings (README, package.json, tags, summary).
 */
export const indexProjectEmbedding = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof indexSingleInputSchema>) => indexSingleInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();

    const env = getServerEnv();
    const pat = env.GH_PAT;
    if (!pat) {
      throw new Error("GH_PAT is not configured");
    }

    const repos = await fetchReposByFullNames(pat, [data.repoFullName]);
    const repo = repos[0];
    if (!repo) {
      throw new Error("Repo not found or is private");
    }

    const db = getDb();
    const [storedRow] = await db
      .select({
        sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
        inferredDescription: projectEmbeddings.inferredDescription,
        inferredTopics: projectEmbeddings.inferredTopics,
        topics: projectEmbeddings.topics,
      })
      .from(projectEmbeddings)
      .where(eq(projectEmbeddings.githubRepoId, repo.id))
      .limit(1);

    const stored = storedRow
      ? {
          sourceEmbeddings: parseSourceEmbeddings(storedRow.sourceEmbeddings),
          inferredDescription: storedRow.inferredDescription,
          inferredTopics: storedRow.inferredTopics,
          topics: storedRow.topics,
        }
      : null;

    const extraction = await fetchRepoExtraction(pat, repo);
    const skipReason = shouldSkipEmbedding({
      force: data.force ?? false,
      skipIfComplete: data.skipIfComplete ?? true,
      repo,
      stored,
      extraction,
    });

    if (skipReason) {
      return { status: "skipped" as const, reason: skipReason, repoFullName: data.repoFullName };
    }

    const description = repo.description?.trim() ?? "";
    const topics = [...repo.topics];
    const sourceEmbeddings: SourceEmbeddingChunk[] = [];

    if (extraction.readme?.trim()) {
      const vector = await embedDocument(extraction.readme);
      sourceEmbeddings.push({
        kind: "readme",
        label: extraction.readmePath ?? "README.md",
        text: extraction.readme,
        embedding: vector,
      });
    }

    for (const chunk of extraction.packageJsonChunks) {
      const text = summarizePackageJson(chunk.path, chunk.content);
      if (!text.trim()) continue;
      const vector = await embedDocument(text);
      sourceEmbeddings.push({
        kind: "package-json",
        label: chunk.path,
        text,
        embedding: vector,
      });
    }

    if (topics.length > 0) {
      const tagsText = `Topics: ${topics.join(", ")}`;
      const vector = await embedDocument(tagsText);
      sourceEmbeddings.push({
        kind: "tags",
        label: "tags",
        text: tagsText,
        embedding: vector,
      });
    }

    const embedText = buildProjectEmbedText({
      name: repo.name,
      nameWithOwner: repo.nameWithOwner,
      description: description || null,
      topics,
    });
    const summaryVector = await embedDocument(embedText);
    sourceEmbeddings.push({
      kind: "summary",
      label: "summary",
      text: embedText,
      embedding: summaryVector,
    });

    const modelId = getEmbeddingModelId();
    const now = new Date();

    await db
      .insert(projectEmbeddings)
      .values({
        githubRepoId: repo.id,
        repoFullName: repo.nameWithOwner,
        repoUrl: `https://github.com/${repo.nameWithOwner}`,
        name: repo.name,
        description: description || null,
        topics: serializeTopics(topics),
        embedText,
        embedding: JSON.stringify(summaryVector),
        sourceEmbeddings: JSON.stringify(sourceEmbeddings),
        modelId,
        embeddedAt: now,
      })
      .onConflictDoUpdate({
        target: projectEmbeddings.githubRepoId,
        set: {
          repoFullName: repo.nameWithOwner,
          repoUrl: `https://github.com/${repo.nameWithOwner}`,
          name: repo.name,
          description: description || null,
          topics: serializeTopics(topics),
          embedText,
          embedding: JSON.stringify(summaryVector),
          sourceEmbeddings: JSON.stringify(sourceEmbeddings),
          modelId,
          embeddedAt: now,
        },
      });

    return {
      status: "processed" as const,
      repoFullName: data.repoFullName,
      sourceCount: sourceEmbeddings.length,
    };
  });
