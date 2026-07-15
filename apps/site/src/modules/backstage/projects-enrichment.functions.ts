import { createBackstageServerFn } from "@/lib/tanstack/create-backstage-server-fn";
import { logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { applyRepoMetadata } from "@/modules/github/apply-repo-metadata";
import { getDb } from "@/lib/db/get-db";
import { createRunRecord } from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { getServerEnv } from "@/lib/envs/server-env";
import { unwrapUnknownError } from "@/utils/errors";
import { runProjectEnrichment } from "@/modules/project-enrichment/run-project-enrichment";
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
import { z } from "zod";

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

const listPaginationInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
  })
  .optional();

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

/**
 * Lists pending enrichment suggestions for backstage review, paginated.
 *
 * Topic JSON columns are parsed into `string[]`; other fields come from the select shape.
 */
export const listProjectEnrichmentSuggestions = createBackstageServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listPaginationInputSchema>) =>
    listPaginationInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectEnrichmentSuggestionListItem>> => {
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
  });

/**
 * Lists recent enrichment runs for backstage, paginated.
 *
 * Rows are returned as-is from Drizzle.
 */
export const listProjectEnrichmentRuns = createBackstageServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listPaginationInputSchema>) =>
    listPaginationInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectEnrichmentRunRow>> => {
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
  });

export const getProjectEnrichmentRun = createBackstageServerFn({ method: "GET" })
  .validator((input: { runId: string }) => ({
    runId: z.string().uuid().parse(input.runId),
  }))
  .handler(async ({ data }) => {
    const db = getDb();
    const [row] = await db
      .select()
      .from(projectEnrichmentRuns)
      .where(eq(projectEnrichmentRuns.id, data.runId))
      .limit(1);

    if (!row) {
      throw new Error("Enrichment run not found");
    }

    return row;
  });

export const approveProjectEnrichmentSuggestion = createBackstageServerFn({ method: "POST" })
  .validator(
    (input: {
      suggestionId: string;
      description: string;
      homepage?: string | null;
      topics: string[];
      enrichedSummary?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
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
  });

export const rejectProjectEnrichmentSuggestion = createBackstageServerFn({ method: "POST" })
  .validator((input: { suggestionId: string }) => input)
  .handler(async ({ data }) => {
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
      .where(eq(projectEnrichmentSuggestions.id, data.suggestionId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new Error("Suggestion not found");
    }

    const now = new Date();

    await db
      .update(projectEnrichmentSuggestions)
      .set({ status: "rejected", reviewedAt: now })
      .where(eq(projectEnrichmentSuggestions.id, data.suggestionId));

    await db
      .update(projectRepos)
      .set({
        attendance: "needs_enrichment",
        updatedAt: now,
      })
      .where(eq(projectRepos.githubRepoId, row.repo.githubRepoId));

    return { ok: true };
  });

const triggerEnrichmentInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  repos: z.array(z.string().regex(/^[^/]+\/[^/]+$/)).optional(),
  force: z.boolean().optional(),
});

export const triggerProjectEnrichmentRun = createBackstageServerFn({ method: "POST" })
  .validator((input: z.infer<typeof triggerEnrichmentInputSchema>) =>
    triggerEnrichmentInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
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
  });
