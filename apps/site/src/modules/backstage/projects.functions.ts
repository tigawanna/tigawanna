import { requireAdminSession } from "@/modules/admin-auth/require-admin";
import { getDb } from "@/lib/db/get-db";
import { fetchReposByFullNames } from "@/modules/project-enrichment/github-client";
import { createRunRecord, importRepoSnapshot } from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { getServerEnv } from "@/lib/envs/server-env";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import {
  desc,
  eq,
  projectAttendanceValues,
  projectRepos,
  type ProjectAttendance,
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
function mapProjectRepoRow(row: ProjectRepoRow): BackstageProject {
  return {
    githubRepoId: row.githubRepoId,
    repoFullName: row.repoFullName,
    currentDescription: row.currentDescription,
    currentTopics: parseTopics(row.currentTopics),
    currentHomepage: row.currentHomepage,
    currentOgImageUrl: row.currentOgImageUrl,
    hasCustomSocialPreview: row.hasCustomSocialPreview,
    attendance: row.attendance,
    lastGithubSyncAt: row.lastGithubSyncAt,
    lastAppliedAt: row.lastAppliedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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

  return rows.map(mapProjectRepoRow);
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
});

/**
 * Fetches a GitHub repository snapshot and upserts it into `project_repos`.
 *
 * Optionally starts a manual enrichment workflow when `runEnrichment` is true.
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

    if (data.runEnrichment) {
      const runId = await createRunRecord("manual", [data.repoFullName]);
      const params: EnrichmentRunParams = {
        runId,
        trigger: "manual",
        limit: 1,
        repos: [data.repoFullName],
        force: true,
      };
      await start(enrichProjectsWorkflow, [params]);
      return { imported: true as const, runId };
    }

    return { imported: true as const, runId: null };
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
