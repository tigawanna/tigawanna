import { requireAdminSession } from "@/modules/admin-auth/require-admin";
import { applyRepoMetadata } from "@/modules/github/apply-repo-metadata";
import { getDb } from "@/lib/db/get-db";
import { createRunRecord } from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { getServerEnv } from "@/lib/envs/server-env";
import { unwrapUnknownError } from "@/utils/errors";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import {
  and,
  desc,
  eq,
  projectEnrichmentRuns,
  projectEnrichmentSuggestions,
  projectRepos,
} from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { start } from "workflow/api";
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

export const listProjectEnrichmentSuggestions = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdminSession();
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
      .where(eq(projectEnrichmentSuggestions.status, "pending_review"))
      .orderBy(desc(projectEnrichmentSuggestions.createdAt));

    return rows.map((row) => ({
      ...row.suggestion,
      suggestedTopics: parseTopics(row.suggestion.suggestedTopics),
      currentTopics: parseTopics(row.repo.currentTopics),
      repoFullName: row.repo.repoFullName,
      currentDescription: row.repo.currentDescription,
      currentHomepage: row.repo.currentHomepage,
      currentOgImageUrl: row.repo.currentOgImageUrl,
    }));
  },
);

export const listProjectRepos = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();

  const rows = await db.select().from(projectRepos).orderBy(desc(projectRepos.lastGithubSyncAt));

  return rows.map((row) => ({
    ...row,
    currentTopics: parseTopics(row.currentTopics),
  }));
});

export const listProjectEnrichmentRuns = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  return db
    .select()
    .from(projectEnrichmentRuns)
    .orderBy(desc(projectEnrichmentRuns.startedAt))
    .limit(20);
});

export const approveProjectEnrichmentSuggestion = createServerFn({ method: "POST" })
  .validator(
    (input: {
      suggestionId: string;
      description: string;
      homepage?: string | null;
      topics: string[];
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
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
        updatedAt: now,
      })
      .where(eq(projectRepos.githubRepoId, row.repo.githubRepoId));

    return { ok: true };
  });

export const rejectProjectEnrichmentSuggestion = createServerFn({ method: "POST" })
  .validator((input: { suggestionId: string }) => input)
  .handler(async ({ data }) => {
    await requireAdminSession();
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

export const triggerProjectEnrichmentRun = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof triggerEnrichmentInputSchema>) =>
    triggerEnrichmentInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();

    const trigger: EnrichmentRunParams["trigger"] = data.repos?.length ? "manual" : "scheduled";
    const runId = await createRunRecord(trigger, data.repos ?? null);

    const params: EnrichmentRunParams = {
      runId,
      trigger,
      limit: data.limit ?? 100,
      repos: data.repos,
      force: data.force ?? false,
    };

    await start(enrichProjectsWorkflow, [params]);

    return { runId, status: "started" as const };
  });
