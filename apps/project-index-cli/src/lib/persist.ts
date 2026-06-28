import { createDb, eq, projectEmbeddings, sql } from "@repo/db";
import type { CliEnv } from "../env.js";
import type { SourceEmbedding } from "./types.js";

export type StoredProjectEmbedding = {
  githubRepoId: string;
  repoFullName: string;
  description: string | null;
  topics: string[];
  sourceEmbeddings: SourceEmbedding[];
  inferredDescription: string | null;
  inferredTopics: string[] | null;
};

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

function parseSourceEmbeddings(raw: string): SourceEmbedding[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (
        typeof entry !== "object" ||
        entry == null ||
        typeof (entry as SourceEmbedding).kind !== "string" ||
        typeof (entry as SourceEmbedding).label !== "string" ||
        typeof (entry as SourceEmbedding).text !== "string" ||
        !Array.isArray((entry as SourceEmbedding).embedding)
      ) {
        return [];
      }

      return [entry as SourceEmbedding];
    });
  } catch {
    return [];
  }
}

export function createCliDb(env: CliEnv) {
  return createDb(env.databaseUrl, env.databaseAuthToken);
}

const MIGRATION_0005_COLUMNS = [
  "repo_url",
  "source_embeddings",
  "inferred_description",
  "inferred_topics",
] as const;

function errorText(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const causeValue = err instanceof Error ? err.cause : undefined;
  const cause =
    causeValue instanceof Error
      ? causeValue.message
      : causeValue != null
        ? String(causeValue)
        : "";
  return [message, cause].filter(Boolean).join(": ");
}

function isNetworkError(text: string) {
  return (
    text.includes("fetch failed") ||
    text.includes("ENOTFOUND") ||
    text.includes("ECONNREFUSED") ||
    text.includes("ETIMEDOUT") ||
    text.includes("EAI_AGAIN")
  );
}

function isMissingColumnError(text: string) {
  return text.includes("no such column") || text.includes("has no column named");
}

export function formatDbError(err: unknown): string {
  const combined = errorText(err);

  if (isNetworkError(combined)) {
    return `${combined}. Cannot reach Turso — check DATABASE_URL, DATABASE_AUTH_TOKEN, VPN, and DNS.`;
  }

  if (isMissingColumnError(combined)) {
    return `${combined}. Apply pending migrations: pnpm --filter site db:migrate`;
  }

  return combined;
}

export async function pingDatabase(db: ReturnType<typeof createCliDb>) {
  try {
    await db.run(sql`SELECT 1`);
  } catch (err: unknown) {
    throw new Error(formatDbError(err), { cause: err instanceof Error ? err : undefined });
  }
}

export async function assertProjectEmbeddingsSchema(db: ReturnType<typeof createCliDb>) {
  try {
    const rows = await db.all<{ name: string }>(
      sql`PRAGMA table_info('project_embeddings')`,
    );
    const columnNames = new Set(rows.map((row) => row.name));
    const missing = MIGRATION_0005_COLUMNS.filter((column) => !columnNames.has(column));

    if (missing.length > 0) {
      throw new Error(
        `project_embeddings is missing columns: ${missing.join(", ")}. Run: pnpm --filter site db:migrate`,
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith("project_embeddings is missing columns")) {
      throw err;
    }

    throw new Error(formatDbError(err), { cause: err instanceof Error ? err : undefined });
  }
}

export async function getStoredProjectEmbedding(
  db: ReturnType<typeof createCliDb>,
  githubRepoId: string,
): Promise<StoredProjectEmbedding | null> {
  const rows = await db
    .select({
      githubRepoId: projectEmbeddings.githubRepoId,
      repoFullName: projectEmbeddings.repoFullName,
      description: projectEmbeddings.description,
      topics: projectEmbeddings.topics,
      sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
      inferredDescription: projectEmbeddings.inferredDescription,
      inferredTopics: projectEmbeddings.inferredTopics,
    })
    .from(projectEmbeddings)
    .where(eq(projectEmbeddings.githubRepoId, githubRepoId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    console.log(`[db] no existing embedding row for repo id ${githubRepoId}`);
    return null;
  }

  const sourceCount = parseSourceEmbeddings(row.sourceEmbeddings).length;
  console.log(
    `[db] found existing row for ${row.repoFullName} (${sourceCount} source embeddings)`,
  );

  return {
    githubRepoId: row.githubRepoId,
    repoFullName: row.repoFullName,
    description: row.description,
    topics: parseTopics(row.topics),
    sourceEmbeddings: parseSourceEmbeddings(row.sourceEmbeddings),
    inferredDescription: row.inferredDescription,
    inferredTopics: row.inferredTopics ? parseTopics(row.inferredTopics) : null,
  };
}

export async function upsertProjectEmbedding(
  db: ReturnType<typeof createCliDb>,
  input: {
    githubRepoId: string;
    repoFullName: string;
    repoUrl: string;
    name: string;
    description: string | null;
    topics: string[];
    embedText: string;
    summaryEmbedding: number[];
    sourceEmbeddings: SourceEmbedding[];
    inferredDescription: string | null;
    inferredTopics: string[] | null;
    modelId: string;
  },
) {
  const now = new Date();

  console.log(
    `[db] upserting ${input.repoFullName} — ${input.sourceEmbeddings.length} sources, ${input.topics.length} tags`,
  );

  await db
    .insert(projectEmbeddings)
    .values({
      githubRepoId: input.githubRepoId,
      repoFullName: input.repoFullName,
      repoUrl: input.repoUrl,
      name: input.name,
      description: input.description,
      topics: JSON.stringify(input.topics),
      embedText: input.embedText,
      embedding: JSON.stringify(input.summaryEmbedding),
      sourceEmbeddings: JSON.stringify(input.sourceEmbeddings),
      inferredDescription: input.inferredDescription,
      inferredTopics: input.inferredTopics ? JSON.stringify(input.inferredTopics) : null,
      modelId: input.modelId,
      embeddedAt: now,
    })
    .onConflictDoUpdate({
      target: projectEmbeddings.githubRepoId,
      set: {
        repoFullName: input.repoFullName,
        repoUrl: input.repoUrl,
        name: input.name,
        description: input.description,
        topics: JSON.stringify(input.topics),
        embedText: input.embedText,
        embedding: JSON.stringify(input.summaryEmbedding),
        sourceEmbeddings: JSON.stringify(input.sourceEmbeddings),
        inferredDescription: input.inferredDescription,
        inferredTopics: input.inferredTopics ? JSON.stringify(input.inferredTopics) : null,
        modelId: input.modelId,
        embeddedAt: now,
      },
    });

  console.log(`[db] saved ${input.repoFullName} to project_embeddings`);
}

export function describeSkipReason(
  repo: { description: string | null; topics: string[] },
  stored: StoredProjectEmbedding | null,
): string | null {
  if (!stored || stored.sourceEmbeddings.length === 0) {
    return null;
  }

  const description = repo.description?.trim() || stored.inferredDescription?.trim() || "";
  const topics =
    repo.topics.length > 0 ? repo.topics : (stored.inferredTopics ?? stored.topics ?? []);

  const missing: string[] = [];
  if (description.length === 0) missing.push("description");
  if (topics.length === 0) missing.push("tags");
  if (stored.sourceEmbeddings.length === 0) missing.push("embeddings");

  if (missing.length === 0) {
    return "embeddings + description + tags all present";
  }

  return `missing: ${missing.join(", ")}`;
}

export function shouldSkipRepo(
  repo: { description: string | null; topics: string[] },
  stored: StoredProjectEmbedding | null,
  force: boolean,
) {
  if (force) {
    return false;
  }

  if (!stored || stored.sourceEmbeddings.length === 0) {
    return false;
  }

  const description = repo.description?.trim() || stored.inferredDescription?.trim() || "";
  const topics =
    repo.topics.length > 0 ? repo.topics : (stored.inferredTopics ?? stored.topics ?? []);

  return description.length > 0 && topics.length > 0;
}
