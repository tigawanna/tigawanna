import { getDb } from "@/lib/db/get-db.server";
import { getServerEnv } from "@/lib/envs/server-env";
import {
  deleteProjectRepoByFullName,
  runImportEnrichment,
} from "@/modules/backstage/projects-import.server";
import {
  countSourceEmbeddings,
  mapProjectRepoRow,
  resolveProjectEnrichment,
  type BackstageProject,
  type BackstageProjectDetail,
  type BackstageProjectEmbedding,
  type EmbeddingEnrichmentHints,
} from "@/modules/backstage/projects.model";
import { fetchReposByFullNames } from "@/modules/project-enrichment/github-client";
import { importRepoSnapshot } from "@/modules/project-enrichment/run-enrichment";
import { fetchRepoReadmeHtml } from "@/modules/github/repo-detail";
import {
  and,
  buildOrderBy,
  buildPaginatedResponse,
  count,
  desc,
  eq,
  normalizePaginationParams,
  projectAttendanceValues,
  projectEmbeddings,
  projectEnrichmentSuggestions,
  projectRepos,
  type PaginatedResponse,
} from "@repo/db";

type ListProjectReposInput = {
  page?: number;
  perPage?: number;
  sortBy?: "lastGithubSyncAt" | "repoFullName" | "attendance" | "updatedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
};

type CreateProjectRepoInput = {
  githubRepoId: string;
  repoFullName: string;
  currentDescription?: string | null;
  currentTopics?: string[];
  currentHomepage?: string | null;
  currentOgImageUrl?: string | null;
  hasCustomSocialPreview?: boolean;
  attendance?: (typeof projectAttendanceValues)[number];
};

type UpdateProjectRepoInput = {
  githubRepoId: string;
  currentDescription?: string | null;
  currentTopics?: string[];
  currentHomepage?: string | null;
  currentOgImageUrl?: string | null;
  hasCustomSocialPreview?: boolean;
  attendance?: (typeof projectAttendanceValues)[number];
  lastAppliedAt?: Date | null;
  lastGithubSyncAt?: Date;
};

type ImportProjectRepoInput = {
  repoFullName: string;
  runEnrichment?: boolean;
  forceEnrichment?: boolean;
};

type ImportAllProjectReposInput = {
  repoFullNames: string[];
  runEnrichment?: boolean;
  forceEnrichment?: boolean;
};

/**
 * Returns the configured GitHub personal access token.
 *
 * @throws When `GH_PAT` is missing from the server environment.
 */
function requirePat() {
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return pat;
}

/**
 * Lists `project_repos` rows for backstage project management, paginated.
 *
 * Topics JSON is parsed into `string[]`; `needsEnrichmentReview` is derived from
 * pending enrichment suggestions.
 */
export async function listProjectRepos(
  data?: ListProjectReposInput,
): Promise<PaginatedResponse<BackstageProject>> {
  const db = getDb();
  const { page, perPage, offset } = normalizePaginationParams(data ?? {});
  const sortBy = data?.sortBy;
  const sortOrder = data?.sortOrder ?? "desc";

  const [{ count: totalItems }] = await db.select({ count: count() }).from(projectRepos);

  const rows = await db
    .select()
    .from(projectRepos)
    .orderBy(
      buildOrderBy({
        sortBy,
        sortOrder,
        columnMap: {
          lastGithubSyncAt: projectRepos.lastGithubSyncAt,
          repoFullName: projectRepos.repoFullName,
          attendance: projectRepos.attendance,
          updatedAt: projectRepos.updatedAt,
          createdAt: projectRepos.createdAt,
        },
        defaultColumn: projectRepos.lastGithubSyncAt,
      }),
    )
    .limit(perPage)
    .offset(offset);

  const pendingRows = await db
    .select({ githubRepoId: projectEnrichmentSuggestions.githubRepoId })
    .from(projectEnrichmentSuggestions)
    .where(eq(projectEnrichmentSuggestions.status, "pending_review"));

  const pendingReviewRepoIds = new Set(pendingRows.map((pendingRow) => pendingRow.githubRepoId));

  const items = rows.map((row) =>
    mapProjectRepoRow(row, {
      needsEnrichmentReview: pendingReviewRepoIds.has(row.githubRepoId),
    }),
  );

  return buildPaginatedResponse({ items, page, perPage, totalItems });
}

/**
 * Inserts a new row into `project_repos`.
 *
 * Defaults `attendance` to `needs_enrichment` when omitted.
 */
export async function createProjectRepo(data: CreateProjectRepoInput): Promise<BackstageProject> {
  const db = getDb();
  const now = new Date();
  const topics = data.currentTopics ?? [];

  await db.insert(projectRepos).values({
    githubRepoId: data.githubRepoId,
    repoFullName: data.repoFullName,
    currentDescription: data.currentDescription ?? null,
    currentTopics: JSON.stringify(topics),
    currentHomepage: data.currentHomepage ?? null,
    currentOgImageUrl: data.currentOgImageUrl ?? null,
    hasCustomSocialPreview: data.hasCustomSocialPreview ?? false,
    attendance: data.attendance ?? "needs_enrichment",
    lastGithubSyncAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(projectRepos)
    .where(eq(projectRepos.githubRepoId, data.githubRepoId));

  if (!row) {
    throw new Error("Failed to create project");
  }

  return mapProjectRepoRow(row);
}

/**
 * Updates an existing `project_repos` row by `githubRepoId`.
 *
 * Only fields present in the request are changed.
 */
export async function updateProjectRepo(data: UpdateProjectRepoInput): Promise<BackstageProject> {
  const db = getDb();
  const { githubRepoId, ...fields } = data;
  const now = new Date();

  const updateSet: Partial<typeof projectRepos.$inferInsert> = {
    updatedAt: now,
  };

  if (fields.currentDescription !== undefined) {
    updateSet.currentDescription = fields.currentDescription;
  }
  if (fields.currentTopics !== undefined) {
    updateSet.currentTopics = JSON.stringify(fields.currentTopics);
  }
  if (fields.currentHomepage !== undefined) {
    updateSet.currentHomepage = fields.currentHomepage;
  }
  if (fields.currentOgImageUrl !== undefined) {
    updateSet.currentOgImageUrl = fields.currentOgImageUrl;
  }
  if (fields.hasCustomSocialPreview !== undefined) {
    updateSet.hasCustomSocialPreview = fields.hasCustomSocialPreview;
  }
  if (fields.attendance !== undefined) {
    updateSet.attendance = fields.attendance;
  }
  if (fields.lastAppliedAt !== undefined) {
    updateSet.lastAppliedAt = fields.lastAppliedAt;
  }
  if (fields.lastGithubSyncAt !== undefined) {
    updateSet.lastGithubSyncAt = fields.lastGithubSyncAt;
  }

  await db.update(projectRepos).set(updateSet).where(eq(projectRepos.githubRepoId, githubRepoId));

  const [row] = await db
    .select()
    .from(projectRepos)
    .where(eq(projectRepos.githubRepoId, githubRepoId));

  if (!row) {
    throw new Error("Project not found");
  }

  return mapProjectRepoRow(row);
}

/**
 * Fetches a GitHub repository snapshot and upserts it into `project_repos`.
 *
 * Optionally runs metadata enrichment when `runEnrichment` is requested.
 */
export async function importProjectRepo(data: ImportProjectRepoInput) {
  const pat = requirePat();

  const repos = await fetchReposByFullNames(pat, [data.repoFullName]);
  const repo = repos[0];
  if (!repo) {
    throw new Error("Repo not found or is private");
  }

  await importRepoSnapshot(repo);

  const runId = await runImportEnrichment([data.repoFullName], data);
  return { imported: true as const, runId };
}

/**
 * Imports multiple GitHub repositories and optionally runs one shared enrichment pass.
 */
export async function importAllProjectRepos(data: ImportAllProjectReposInput) {
  const pat = requirePat();

  const repos = await fetchReposByFullNames(pat, data.repoFullNames);
  if (repos.length === 0) {
    throw new Error("No repos found or all are private");
  }

  for (const repo of repos) {
    await importRepoSnapshot(repo);
  }

  const importedNames = repos.map((repo) => repo.nameWithOwner);
  const runId = await runImportEnrichment(importedNames, data);

  return {
    imported: true as const,
    importedCount: repos.length,
    runId,
  };
}

/**
 * Removes a repository from `project_repos` without deleting it on GitHub.
 */
export async function removeProjectRepo(repoFullName: string) {
  await deleteProjectRepoByFullName(repoFullName);
  return { ok: true as const };
}

/**
 * Loads a backstage project with GitHub metadata, enrichment output, and README HTML.
 */
export async function getBackstageProjectDetail(
  repoFullName: string,
): Promise<BackstageProjectDetail> {
  const db = getDb();

  const [row] = await db
    .select()
    .from(projectRepos)
    .where(eq(projectRepos.repoFullName, repoFullName))
    .limit(1);

  if (!row) {
    throw new Error("Project not found");
  }

  const [pendingSuggestionRow] = await db
    .select()
    .from(projectEnrichmentSuggestions)
    .where(
      and(
        eq(projectEnrichmentSuggestions.githubRepoId, row.githubRepoId),
        eq(projectEnrichmentSuggestions.status, "pending_review"),
      ),
    )
    .orderBy(desc(projectEnrichmentSuggestions.createdAt))
    .limit(1);

  const [latestSuggestionRow] = await db
    .select()
    .from(projectEnrichmentSuggestions)
    .where(eq(projectEnrichmentSuggestions.githubRepoId, row.githubRepoId))
    .orderBy(desc(projectEnrichmentSuggestions.createdAt))
    .limit(1);

  const suggestionRow = pendingSuggestionRow ?? latestSuggestionRow;

  const [embeddingRow] = await db
    .select({
      modelId: projectEmbeddings.modelId,
      embeddedAt: projectEmbeddings.embeddedAt,
      sourceEmbeddings: projectEmbeddings.sourceEmbeddings,
      embedText: projectEmbeddings.embedText,
      inferredDescription: projectEmbeddings.inferredDescription,
    })
    .from(projectEmbeddings)
    .where(eq(projectEmbeddings.githubRepoId, row.githubRepoId))
    .limit(1);

  const embeddingSourceCount = countSourceEmbeddings(embeddingRow?.sourceEmbeddings);
  const embeddingHints: EmbeddingEnrichmentHints | null = embeddingRow
    ? {
        embedText: embeddingRow.embedText,
        inferredDescription: embeddingRow.inferredDescription,
        embeddedAt: embeddingRow.embeddedAt,
        sourceCount: embeddingSourceCount,
      }
    : null;

  const project = mapProjectRepoRow(row, {
    needsEnrichmentReview: pendingSuggestionRow != null,
  });
  const enrichment = resolveProjectEnrichment(project, suggestionRow, embeddingHints);
  const projectWithReview: BackstageProject = {
    ...project,
    needsEnrichmentReview:
      enrichment?.status === "pending_review" && enrichment.suggestionId != null,
  };

  const embedding: BackstageProjectEmbedding | null = embeddingRow
    ? {
        modelId: embeddingRow.modelId,
        embeddedAt: embeddingRow.embeddedAt,
        sourceCount: embeddingSourceCount,
      }
    : null;

  const [owner, repoName] = repoFullName.split("/");
  const readmeHtml = owner && repoName ? await fetchRepoReadmeHtml(owner, repoName) : null;

  const pat = getServerEnv().GH_PAT;
  let github: BackstageProjectDetail["github"] = null;

  if (pat) {
    const repos = await fetchReposByFullNames(pat, [repoFullName]);
    const snapshot = repos[0];
    if (snapshot) {
      github = {
        description: snapshot.description,
        homepageUrl: snapshot.homepageUrl,
        topics: snapshot.topics,
      };
    }
  }

  return {
    project: projectWithReview,
    github,
    enrichment,
    embedding,
    readmeHtml,
  } satisfies BackstageProjectDetail;
}
