import { requireAdminSession } from "@/modules/admin-auth/require-admin";
import { logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { getDb } from "@/lib/db/get-db";
import { isServerEmbeddingEnabled } from "@/lib/envs/server-embedding";
import { fetchReposByFullNames } from "@/modules/project-enrichment/github-client";
import { createRunRecord, importRepoSnapshot } from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { getServerEnv } from "@/lib/envs/server-env";
import { fetchRepoReadmeHtml } from "@/modules/github/repo-detail";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import {
  and,
  desc,
  eq,
  projectAttendanceValues,
  projectEmbeddings,
  projectEnrichmentSuggestions,
  projectRepos,
  type ProjectAttendance,
  type ProjectEnrichmentSuggestionStatus,
  type ProjectRepoRow,
} from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { start } from "workflow/api";
import { z } from "zod";

const repoFullNameSchema = z.string().regex(/^[^/]+\/[^/]+$/);

/**
 * Parses a JSON-encoded topic list stored on `project_repos.current_topics`.
 *
 * @param raw - Serialized topics column value.
 * @returns Parsed topic strings, or an empty array when invalid.
 */
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

/** How backstage resolved enrichment for display. */
export type BackstageEnrichmentSource = "ai_suggestion" | "ai_record" | "metadata";

/** Enrichment suggestion surfaced on the backstage project detail page. */
export type BackstageProjectEnrichment = {
  source: BackstageEnrichmentSource;
  isAiEnriched: boolean;
  suggestionId: string | null;
  status: ProjectEnrichmentSuggestionStatus | "complete";
  suggestedDescription: string | null;
  suggestedTopics: string[];
  suggestedHomepage: string | null;
  briefSummary: string | null;
  confidence: {
    description: number;
    topics: number;
    homepage: number;
  } | null;
  enrichedAt: Date;
  applyError: string | null;
};

/** Indexed embedding metadata for a backstage project. */
export type BackstageProjectEmbedding = {
  modelId: string;
  embeddedAt: Date;
  sourceCount: number;
};

/** Full backstage project detail payload. */
export type BackstageProjectDetail = {
  project: BackstageProject;
  github: {
    description: string | null;
    homepageUrl: string | null;
    topics: string[];
  } | null;
  enrichment: BackstageProjectEnrichment | null;
  embedding: BackstageProjectEmbedding | null;
  readmeHtml: string | null;
};

/**
 * Counts stored source embedding chunks from serialized JSON.
 */
function countSourceEmbeddings(raw: string | null | undefined) {
  if (!raw) {
    return 0;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}
/**
 * Parses enrichment analysis metadata stored on suggestions.
 */
function parseAnalysisSummary(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      reasoning?: string;
      confidence?: {
        description?: number;
        topics?: number;
        homepage?: number;
      };
    };

    const confidence =
      parsed.confidence &&
      typeof parsed.confidence.description === "number" &&
      typeof parsed.confidence.topics === "number" &&
      typeof parsed.confidence.homepage === "number"
        ? {
            description: parsed.confidence.description,
            topics: parsed.confidence.topics,
            homepage: parsed.confidence.homepage,
          }
        : null;

    return {
      briefSummary: typeof parsed.reasoning === "string" ? parsed.reasoning : null,
      confidence,
    };
  } catch {
    return null;
  }
}

/** Backstage-facing project row with parsed topic tags. */
export type BackstageProject = {
  githubRepoId: string;
  repoFullName: string;
  currentDescription: string | null;
  currentTopics: string[];
  currentHomepage: string | null;
  currentOgImageUrl: string | null;
  hasCustomSocialPreview: boolean;
  attendance: ProjectAttendance;
  enrichedSummary: string | null;
  enrichedAt: Date | null;
  enrichedByAi: boolean;
  /** True when a `pending_review` enrichment suggestion exists for this repo. */
  needsEnrichmentReview: boolean;
  lastGithubSyncAt: Date;
  lastAppliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Maps a `project_repos` row to the backstage project shape with parsed topics.
 *
 * @param row - Raw database row.
 */
function mapProjectRepoRow(
  row: ProjectRepoRow,
  options?: { needsEnrichmentReview?: boolean },
): BackstageProject {
  return {
    githubRepoId: row.githubRepoId,
    repoFullName: row.repoFullName,
    currentDescription: row.currentDescription,
    currentTopics: parseTopics(row.currentTopics),
    currentHomepage: row.currentHomepage,
    currentOgImageUrl: row.currentOgImageUrl,
    hasCustomSocialPreview: row.hasCustomSocialPreview,
    attendance: row.attendance,
    enrichedSummary: row.enrichedSummary,
    enrichedAt: row.enrichedAt,
    enrichedByAi: row.enrichedByAi,
    needsEnrichmentReview: options?.needsEnrichmentReview ?? false,
    lastGithubSyncAt: row.lastGithubSyncAt,
    lastAppliedAt: row.lastAppliedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type EnrichmentSuggestionRow = typeof projectEnrichmentSuggestions.$inferSelect;

type EmbeddingEnrichmentHints = {
  embedText: string | null;
  inferredDescription: string | null;
  embeddedAt: Date;
  sourceCount: number;
};

/**
 * Returns true when a project has both a non-empty description and at least one tag.
 */
function hasCompleteProjectMetadata(project: BackstageProject) {
  return (project.currentDescription?.trim().length ?? 0) > 0 && project.currentTopics.length > 0;
}

/**
 * Resolves enrichment display data from suggestions, AI records, or stored metadata.
 *
 * Priority: latest AI suggestion → persisted AI enrichment record → description/tags or
 * indexed vectors (metadata-complete path).
 */
function resolveProjectEnrichment(
  project: BackstageProject,
  suggestionRow: EnrichmentSuggestionRow | undefined,
  embedding: EmbeddingEnrichmentHints | null,
): BackstageProjectEnrichment | null {
  if (suggestionRow) {
    const analysis = parseAnalysisSummary(suggestionRow.analysisSummary);

    return {
      source: "ai_suggestion",
      isAiEnriched: true,
      suggestionId: suggestionRow.id,
      status: suggestionRow.status,
      suggestedDescription: suggestionRow.suggestedDescription,
      suggestedTopics: parseTopics(suggestionRow.suggestedTopics),
      suggestedHomepage: suggestionRow.suggestedHomepage,
      briefSummary: analysis?.briefSummary ?? project.enrichedSummary,
      confidence: analysis?.confidence ?? null,
      enrichedAt: project.enrichedAt ?? suggestionRow.createdAt,
      applyError: suggestionRow.applyError,
    };
  }

  if (project.enrichedByAi && project.enrichedSummary) {
    return {
      source: "ai_record",
      isAiEnriched: true,
      suggestionId: null,
      status: project.attendance === "pending_review" ? "pending_review" : "complete",
      suggestedDescription: project.currentDescription,
      suggestedTopics: project.currentTopics,
      suggestedHomepage: project.currentHomepage,
      briefSummary: project.enrichedSummary,
      confidence: null,
      enrichedAt: project.enrichedAt ?? project.updatedAt,
      applyError: null,
    };
  }

  const metadataComplete = hasCompleteProjectMetadata(project);
  const hasVectors = embedding != null && embedding.sourceCount > 0;

  if (!metadataComplete && !hasVectors) {
    return null;
  }

  const briefSummary =
    project.enrichedSummary?.trim() ||
    embedding?.inferredDescription?.trim() ||
    embedding?.embedText?.trim() ||
    project.currentDescription?.trim() ||
    null;

  return {
    source: "metadata",
    isAiEnriched: false,
    suggestionId: null,
    status: "complete",
    suggestedDescription: project.currentDescription,
    suggestedTopics: project.currentTopics,
    suggestedHomepage: project.currentHomepage,
    briefSummary,
    confidence: null,
    enrichedAt: project.enrichedAt ?? embedding?.embeddedAt ?? project.lastGithubSyncAt,
    applyError: null,
  };
}

/**
 * Deletes a project row by repository full name.
 *
 * @param fullName - GitHub `owner/repo` identifier.
 */
async function deleteProjectRepoByFullName(fullName: string) {
  const db = getDb();
  await db.delete(projectRepos).where(eq(projectRepos.repoFullName, fullName));
}

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
 * Lists all rows from `project_repos` for backstage project management.
 *
 * Requires an authenticated admin session.
 */
export const listProjectRepos = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();

  const rows = await db.select().from(projectRepos).orderBy(desc(projectRepos.lastGithubSyncAt));

  const pendingRows = await db
    .select({ githubRepoId: projectEnrichmentSuggestions.githubRepoId })
    .from(projectEnrichmentSuggestions)
    .where(eq(projectEnrichmentSuggestions.status, "pending_review"));

  const pendingReviewRepoIds = new Set(pendingRows.map((pendingRow) => pendingRow.githubRepoId));

  return rows.map((row) =>
    mapProjectRepoRow(row, {
      needsEnrichmentReview: pendingReviewRepoIds.has(row.githubRepoId),
    }),
  );
});

const createProjectRepoInputSchema = z.object({
  githubRepoId: z.string().min(1),
  repoFullName: repoFullNameSchema,
  currentDescription: z.string().nullable().optional(),
  currentTopics: z.array(z.string()).optional(),
  currentHomepage: z.string().nullable().optional(),
  currentOgImageUrl: z.string().nullable().optional(),
  hasCustomSocialPreview: z.boolean().optional(),
  attendance: z.enum(projectAttendanceValues).optional(),
});

/**
 * Inserts a new row into `project_repos`.
 *
 * Use for manual project creation. Defaults `attendance` to `needs_enrichment`
 * when omitted.
 *
 * Requires an authenticated admin session.
 */
export const createProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof createProjectRepoInputSchema>) =>
    createProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
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
  });

const updateProjectRepoInputSchema = z.object({
  githubRepoId: z.string().min(1),
  currentDescription: z.string().nullable().optional(),
  currentTopics: z.array(z.string()).optional(),
  currentHomepage: z.string().nullable().optional(),
  currentOgImageUrl: z.string().nullable().optional(),
  hasCustomSocialPreview: z.boolean().optional(),
  attendance: z.enum(projectAttendanceValues).optional(),
  lastAppliedAt: z.coerce.date().nullable().optional(),
  lastGithubSyncAt: z.coerce.date().optional(),
});

/**
 * Updates an existing `project_repos` row by `githubRepoId`.
 *
 * Only fields present in the request are changed.
 *
 * Requires an authenticated admin session.
 */
export const updateProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof updateProjectRepoInputSchema>) =>
    updateProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
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
  });

const importProjectRepoInputSchema = z.object({
  repoFullName: repoFullNameSchema,
  runEnrichment: z.boolean().optional(),
  forceEnrichment: z.boolean().optional(),
  runEmbedding: z.boolean().optional(),
  skipEmbeddingIfComplete: z.boolean().optional(),
  forceEmbedding: z.boolean().optional(),
});

const importAllProjectReposInputSchema = z.object({
  repoFullNames: z.array(repoFullNameSchema).min(1),
  runEnrichment: z.boolean().optional(),
  forceEnrichment: z.boolean().optional(),
  runEmbedding: z.boolean().optional(),
  skipEmbeddingIfComplete: z.boolean().optional(),
  forceEmbedding: z.boolean().optional(),
});

type ImportWorkflowInput = {
  runEnrichment?: boolean;
  forceEnrichment?: boolean;
  runEmbedding?: boolean;
  skipEmbeddingIfComplete?: boolean;
  forceEmbedding?: boolean;
};

/**
 * Starts the enrichment/embedding workflow for one or more repos when requested.
 */
async function startImportWorkflow(repoFullNames: string[], data: ImportWorkflowInput) {
  const wantsEnrichment = data.runEnrichment === true;
  const wantsEmbedding = data.runEmbedding === true;
  const embeddingEnabled = isServerEmbeddingEnabled();
  const shouldStartWorkflow = wantsEnrichment || (wantsEmbedding && embeddingEnabled);

  if (!shouldStartWorkflow) {
    return null;
  }

  const runId = await createRunRecord("manual", repoFullNames);
  const forceEnrichment = data.forceEnrichment ?? (repoFullNames.length === 1 ? true : false);

  const params: EnrichmentRunParams = {
    runId,
    trigger: "manual",
    limit: repoFullNames.length,
    repos: repoFullNames,
    force: forceEnrichment,
    runEnrichment: wantsEnrichment,
    runEmbedding: wantsEmbedding && embeddingEnabled,
    skipEmbeddingIfComplete: data.skipEmbeddingIfComplete ?? true,
    forceEmbedding: data.forceEmbedding ?? false,
  };

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "startWorkflow",
    outcome: "started",
    trigger: "manual",
    repoCount: repoFullNames.length,
    force: forceEnrichment,
  });

  await start(enrichProjectsWorkflow, [params]);
  return runId;
}

/**
 * Fetches a GitHub repository snapshot and upserts it into `project_repos`.
 *
 * Optionally starts a manual enrichment workflow when `runEnrichment` or
 * server-side `runEmbedding` is requested (embedding runs in dev/local only).
 *
 * Requires an authenticated admin session.
 */
export const importProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importProjectRepoInputSchema>) =>
    importProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();

    const repos = await fetchReposByFullNames(pat, [data.repoFullName]);
    const repo = repos[0];
    if (!repo) {
      throw new Error("Repo not found or is private");
    }

    await importRepoSnapshot(repo);

    const runId = await startImportWorkflow([data.repoFullName], data);
    return { imported: true as const, runId };
  });

/**
 * Imports multiple GitHub repositories and optionally starts one shared workflow.
 *
 * Requires an authenticated admin session.
 */
export const importAllProjectRepos = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importAllProjectReposInputSchema>) =>
    importAllProjectReposInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();

    const repos = await fetchReposByFullNames(pat, data.repoFullNames);
    if (repos.length === 0) {
      throw new Error("No repos found or all are private");
    }

    for (const repo of repos) {
      await importRepoSnapshot(repo);
    }

    const importedNames = repos.map((repo) => repo.nameWithOwner);
    const runId = await startImportWorkflow(importedNames, data);

    return {
      imported: true as const,
      importedCount: repos.length,
      runId,
    };
  });

/**
 * Removes a repository from `project_repos` without deleting it on GitHub.
 *
 * Requires an authenticated admin session.
 */
export const removeProjectRepo = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    await deleteProjectRepoByFullName(data.repoFullName);
    return { ok: true as const };
  });

/**
 * Loads a backstage project with GitHub metadata, enrichment output, and README HTML.
 */
export const getBackstageProjectDetail = createServerFn({ method: "GET" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const db = getDb();

    const [row] = await db
      .select()
      .from(projectRepos)
      .where(eq(projectRepos.repoFullName, data.repoFullName))
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

    const [owner, repoName] = data.repoFullName.split("/");
    const readmeHtml = owner && repoName ? await fetchRepoReadmeHtml(owner, repoName) : null;

    const pat = getServerEnv().GH_PAT;
    let github: BackstageProjectDetail["github"] = null;

    if (pat) {
      const repos = await fetchReposByFullNames(pat, [data.repoFullName]);
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
  });
