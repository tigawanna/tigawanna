import { embedDocument, getEmbeddingModelId } from "@/modules/backstage/gemma-embedding-service";
import {
  fetchRepoExtraction,
  readmeHasDescription,
  readmeHasTags,
  summarizePackageJson,
} from "@/modules/github/repo-extraction";
import {
  fetchReposByFullNames,
  type GithubRepoSnapshot,
} from "@/modules/project-enrichment/github-client";
import { getDb } from "@/lib/db/get-db";
import { isServerEmbeddingEnabled } from "@/lib/envs/server-embedding";
import { getServerEnv } from "@/lib/envs/server-env";
import { desc, eq, projectEmbeddings, projectEnrichmentSuggestions, projectRepos } from "@repo/db";

export type IndexRepoEmbeddingInput = {
  repoFullName: string;
  skipIfComplete?: boolean;
  force?: boolean;
};

export type IndexRepoEmbeddingResult =
  | { status: "processed"; repoFullName: string; sourceCount: number }
  | { status: "skipped"; repoFullName: string; reason: string }
  | { status: "disabled"; repoFullName: string; reason: string };

type SourceEmbeddingChunk = {
  kind: string;
  label: string;
  text: string;
  embedding: number[];
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

function serializeTopics(topics: string[]) {
  return JSON.stringify(topics);
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

function shouldSkipEmbedding(input: {
  force: boolean;
  skipIfComplete: boolean;
  description: string;
  topics: string[];
  stored: {
    sourceEmbeddings: SourceEmbeddingChunk[];
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
  const hasDescription =
    input.description.length > 0 || Boolean(readme && readmeHasDescription(readme));
  const hasTopics = input.topics.length > 0 || Boolean(readme && readmeHasTags(readme));

  if (hasDescription && hasTopics) {
    return "Embeddings, description, and tags already present";
  }

  return null;
}

/**
 * Resolves description and topics for embedding from project_repos and enrichment suggestions.
 */
async function resolveEnrichedEmbedMetadata(githubRepoId: string, repo: GithubRepoSnapshot) {
  const db = getDb();

  const [projectRow] = await db
    .select({
      currentDescription: projectRepos.currentDescription,
      currentTopics: projectRepos.currentTopics,
    })
    .from(projectRepos)
    .where(eq(projectRepos.githubRepoId, githubRepoId))
    .limit(1);

  const [suggestionRow] = await db
    .select({
      suggestedDescription: projectEnrichmentSuggestions.suggestedDescription,
      suggestedTopics: projectEnrichmentSuggestions.suggestedTopics,
    })
    .from(projectEnrichmentSuggestions)
    .where(eq(projectEnrichmentSuggestions.githubRepoId, githubRepoId))
    .orderBy(desc(projectEnrichmentSuggestions.createdAt))
    .limit(1);

  const description =
    projectRow?.currentDescription?.trim() ||
    suggestionRow?.suggestedDescription?.trim() ||
    repo.description?.trim() ||
    "";

  let topics = repo.topics.length > 0 ? [...repo.topics] : [];
  if (topics.length === 0 && projectRow?.currentTopics) {
    topics = parseTopics(projectRow.currentTopics);
  }
  if (topics.length === 0 && suggestionRow?.suggestedTopics) {
    topics = parseTopics(suggestionRow.suggestedTopics);
  }

  return {
    description,
    topics,
    hasEnrichmentRow: projectRow != null,
    hasSuggestion: suggestionRow != null,
  };
}

function buildProjectEmbedText(repo: {
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

/**
 * Indexes one repository with Gemma embeddings using enriched project metadata when available.
 */
export async function indexRepoEmbedding(
  input: IndexRepoEmbeddingInput,
): Promise<IndexRepoEmbeddingResult> {
  if (!isServerEmbeddingEnabled()) {
    return {
      status: "disabled",
      repoFullName: input.repoFullName,
      reason: "Server-side embedding is disabled in this environment",
    };
  }

  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }

  const repos = await fetchReposByFullNames(pat, [input.repoFullName]);
  const repo = repos[0];
  if (!repo) {
    throw new Error("Repo not found or is private");
  }

  const db = getDb();
  const enriched = await resolveEnrichedEmbedMetadata(repo.id, repo);

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
  const description = enriched.description;
  const topics = enriched.topics;

  const skipReason = shouldSkipEmbedding({
    force: input.force ?? false,
    skipIfComplete: input.skipIfComplete ?? true,
    description,
    topics,
    stored: stored ? { sourceEmbeddings: stored.sourceEmbeddings } : null,
    extraction,
  });

  if (skipReason) {
    return { status: "skipped", reason: skipReason, repoFullName: input.repoFullName };
  }

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
    status: "processed",
    repoFullName: input.repoFullName,
    sourceCount: sourceEmbeddings.length,
  };
}
