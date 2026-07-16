import { getDb } from "@/lib/db/get-db.server";
import { applyRepoMetadata } from "@/modules/github/apply-repo-metadata";
import { logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { createRunRecord } from "@/modules/project-enrichment/run-enrichment";
import { runProjectEnrichment } from "@/modules/project-enrichment/run-project-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { getServerEnv } from "@/lib/envs/server-env";
import { unwrapUnknownError } from "@/utils/errors";
import {
  and,
  buildPaginatedResponse,
  count,
  desc,
  eq,
  normalizePaginationParams,
  projectEnrichmentRuns,
  projectEnrichmentSuggestions,
  projectRepos,
  type PaginatedResponse,
  type ProjectEnrichmentRunRow,
} from "@repo/db";

/** Pending enrichment suggestion joined with current repo fields. */
export type ProjectEnrichmentSuggestionListItem = {
  id: string;
  runId: string;
  githubRepoId: string;
  status: (typeof projectEnrichmentSuggestions.$inferSelect)["status"];
  suggestedDescription: string | null;
  suggestedTopics: string[];
  suggestedHomepage: string | null;
  analysisSummary: string | null;
  applyError: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  appliedAt: Date | null;
  repoFullName: string;
  currentDescription: string | null;
  currentTopics: string[];
  currentHomepage: string | null;
  currentOgImageUrl: string | null;
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

export async function listProjectEnrichmentSuggestions(data?: {
  page?: number;
  perPage?: number;
}): Promise<PaginatedResponse<ProjectEnrichmentSuggestionListItem>> {
  const db = getDb();
  const { page, perPage, offset } = normalizePaginationParams(data ?? {});

  const [{ count: totalItems }] = await db
    .select({ count: count() })
    .from(projectEnrichmentSuggestions)
    .innerJoin(
      projectRepos,
      eq(projectEnrichmentSuggestions.githubRepoId, projectRepos.githubRepoId),
    )
    .where(eq(projectEnrichmentSuggestions.status, "pending_review"));

  const rows = await db
    .select({
      id: projectEnrichmentSuggestions.id,
      runId: projectEnrichmentSuggestions.runId,
      githubRepoId: projectEnrichmentSuggestions.githubRepoId,
      status: projectEnrichmentSuggestions.status,
      suggestedDescription: projectEnrichmentSuggestions.suggestedDescription,
      suggestedTopics: projectEnrichmentSuggestions.suggestedTopics,
      suggestedHomepage: projectEnrichmentSuggestions.suggestedHomepage,
      analysisSummary: projectEnrichmentSuggestions.analysisSummary,
      applyError: projectEnrichmentSuggestions.applyError,
      createdAt: projectEnrichmentSuggestions.createdAt,
      reviewedAt: projectEnrichmentSuggestions.reviewedAt,
      appliedAt: projectEnrichmentSuggestions.appliedAt,
      repoFullName: projectRepos.repoFullName,
      currentDescription: projectRepos.currentDescription,
      currentTopics: projectRepos.currentTopics,
      currentHomepage: projectRepos.currentHomepage,
      currentOgImageUrl: projectRepos.currentOgImageUrl,
    })
    .from(projectEnrichmentSuggestions)
    .innerJoin(
      projectRepos,
      eq(projectEnrichmentSuggestions.githubRepoId, projectRepos.githubRepoId),
    )
    .where(eq(projectEnrichmentSuggestions.status, "pending_review"))
    .orderBy(desc(projectEnrichmentSuggestions.createdAt))
    .limit(perPage)
    .offset(offset);

  const items = rows.map((row) => ({
    ...row,
    suggestedTopics: parseTopics(row.suggestedTopics),
    currentTopics: parseTopics(row.currentTopics),
  }));

  return buildPaginatedResponse({ items, page, perPage, totalItems });
}

export async function listProjectEnrichmentRuns(data?: {
  page?: number;
  perPage?: number;
}): Promise<PaginatedResponse<ProjectEnrichmentRunRow>> {
  const db = getDb();
  const { page, perPage, offset } = normalizePaginationParams(data ?? {}, { perPage: 20 });

  const [{ count: totalItems }] = await db.select({ count: count() }).from(projectEnrichmentRuns);

  const items = await db
    .select()
    .from(projectEnrichmentRuns)
    .orderBy(desc(projectEnrichmentRuns.startedAt))
    .limit(perPage)
    .offset(offset);

  return buildPaginatedResponse({ items, page, perPage, totalItems });
}

export async function getProjectEnrichmentRun(runId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(projectEnrichmentRuns)
    .where(eq(projectEnrichmentRuns.id, runId))
    .limit(1);

  if (!row) {
    throw new Error("Enrichment run not found");
  }

  return row;
}

export async function approveProjectEnrichmentSuggestion(data: {
  suggestionId: string;
  description: string;
  homepage?: string | null;
  topics: string[];
  enrichedSummary?: string | null;
}) {
  const env = getServerEnv();
  const pat = env.GH_PAT;

  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }

  const db = getDb();
  const rows = await db
    .select({
      suggestion: projectEnrichmentSuggestions,
      repo: projectRepos,
    })
    .from(projectEnrichmentSuggestions)
    .innerJoin(
      projectRepos,
      eq(projectEnrichmentSuggestions.githubRepoId, projectRepos.githubRepoId),
    )
    .where(
      and(
        eq(projectEnrichmentSuggestions.id, data.suggestionId),
        eq(projectEnrichmentSuggestions.status, "pending_review"),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Suggestion not found");
  }

  try {
    await applyRepoMetadata(pat, row.repo.repoFullName, {
      description: data.description.trim(),
      homepage: data.homepage?.trim() || null,
      topics: data.topics.map((topic) => topic.trim()).filter((topic) => topic.length > 0),
    });
  } catch (error: unknown) {
    const message = unwrapUnknownError(error).message;
    await db
      .update(projectEnrichmentSuggestions)
      .set({ applyError: message })
      .where(eq(projectEnrichmentSuggestions.id, data.suggestionId));
    throw error;
  }

  const now = new Date();
  const enrichedSummary = data.enrichedSummary?.trim() || null;
  let analysisSummary = row.suggestion.analysisSummary;

  if (enrichedSummary) {
    try {
      const existing = analysisSummary
        ? (JSON.parse(analysisSummary) as Record<string, unknown>)
        : {};
      analysisSummary = JSON.stringify({ ...existing, reasoning: enrichedSummary });
    } catch {
      analysisSummary = JSON.stringify({ reasoning: enrichedSummary });
    }
  }

  await db
    .update(projectEnrichmentSuggestions)
    .set({
      status: "applied",
      suggestedDescription: data.description.trim(),
      suggestedHomepage: data.homepage?.trim() || null,
      suggestedTopics: JSON.stringify(data.topics),
      reviewedAt: now,
      appliedAt: now,
      applyError: null,
      ...(analysisSummary !== row.suggestion.analysisSummary ? { analysisSummary } : {}),
    })
    .where(eq(projectEnrichmentSuggestions.id, data.suggestionId));

  await db
    .update(projectRepos)
    .set({
      currentDescription: data.description.trim(),
      currentHomepage: data.homepage?.trim() || null,
      currentTopics: JSON.stringify(data.topics),
      attendance: "applied",
      lastAppliedAt: now,
      enrichedSummary: enrichedSummary ?? row.repo.enrichedSummary,
      enrichedAt: row.repo.enrichedAt ?? now,
      enrichedByAi: true,
      updatedAt: now,
    })
    .where(eq(projectRepos.githubRepoId, row.repo.githubRepoId));

  return { ok: true };
}

export async function rejectProjectEnrichmentSuggestion(suggestionId: string) {
  const db = getDb();

  const rows = await db
    .select({
      suggestion: projectEnrichmentSuggestions,
      repo: projectRepos,
    })
    .from(projectEnrichmentSuggestions)
    .innerJoin(
      projectRepos,
      eq(projectEnrichmentSuggestions.githubRepoId, projectRepos.githubRepoId),
    )
    .where(eq(projectEnrichmentSuggestions.id, suggestionId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Suggestion not found");
  }

  const now = new Date();

  await db
    .update(projectEnrichmentSuggestions)
    .set({ status: "rejected", reviewedAt: now })
    .where(eq(projectEnrichmentSuggestions.id, suggestionId));

  await db
    .update(projectRepos)
    .set({
      attendance: "needs_enrichment",
      updatedAt: now,
    })
    .where(eq(projectRepos.githubRepoId, row.repo.githubRepoId));

  return { ok: true };
}

export async function triggerProjectEnrichmentRun(data: {
  limit?: number;
  repos?: string[];
  force?: boolean;
}) {
  const trigger: EnrichmentRunParams["trigger"] = data.repos?.length ? "manual" : "scheduled";
  const runId = await createRunRecord(trigger, data.repos ?? null);

  const params: EnrichmentRunParams = {
    runId,
    trigger,
    limit: data.limit ?? 100,
    repos: data.repos,
    force: data.force ?? false,
  };

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "startEnrichment",
    outcome: "started",
    trigger,
    repoCount: data.repos?.length,
    force: data.force ?? false,
  });

  await runProjectEnrichment(params);

  return { runId, status: "completed" as const };
}
