import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  createProjectRepo as createProjectRepoImpl,
  getBackstageProjectDetail as getBackstageProjectDetailImpl,
  importAllProjectRepos as importAllProjectReposImpl,
  importProjectRepo as importProjectRepoImpl,
  listProjectRepos as listProjectReposImpl,
  removeProjectRepo as removeProjectRepoImpl,
  updateProjectRepo as updateProjectRepoImpl,
} from "@/modules/backstage/projects.server";
import {
  parseMonorepoPackages,
  type BackstageProject,
  type BackstageProjectDetail,
  type BackstageProjectEmbedding,
  type BackstageProjectEnrichment,
  type MonorepoPackageDescription,
} from "@/modules/backstage/projects.model";
import { projectAttendanceValues, type PaginatedResponse } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type {
  BackstageProject,
  BackstageProjectDetail,
  BackstageProjectEmbedding,
  BackstageProjectEnrichment,
  MonorepoPackageDescription,
};

export { parseMonorepoPackages };

const repoFullNameSchema = z.string().regex(/^[^/]+\/[^/]+$/);

const listProjectReposInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
    sortBy: z
      .enum(["lastGithubSyncAt", "repoFullName", "attendance", "updatedAt", "createdAt"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

/**
 * Lists `project_repos` rows for backstage project management, paginated.
 *
 * Requires an authenticated admin session. Topics JSON is parsed into `string[]`;
 * `needsEnrichmentReview` is derived from pending enrichment suggestions.
 */
export const listProjectRepos = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listProjectReposInputSchema>) =>
    listProjectReposInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<BackstageProject>> => {
    await requireBackstageSession();
    return listProjectReposImpl(data);
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
    await requireBackstageSession();
    return createProjectRepoImpl(data);
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
    await requireBackstageSession();
    return updateProjectRepoImpl(data);
  });

const importProjectRepoInputSchema = z.object({
  repoFullName: repoFullNameSchema,
  runEnrichment: z.boolean().optional(),
  forceEnrichment: z.boolean().optional(),
});

const importAllProjectReposInputSchema = z.object({
  repoFullNames: z.array(repoFullNameSchema).min(1),
  runEnrichment: z.boolean().optional(),
  forceEnrichment: z.boolean().optional(),
});

/**
 * Fetches a GitHub repository snapshot and upserts it into `project_repos`.
 *
 * Optionally runs metadata enrichment when `runEnrichment` is requested.
 * Requires an authenticated admin session.
 */
export const importProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importProjectRepoInputSchema>) =>
    importProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return importProjectRepoImpl(data);
  });

/**
 * Imports multiple GitHub repositories and optionally runs one shared enrichment pass.
 *
 * Requires an authenticated admin session.
 */
export const importAllProjectRepos = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importAllProjectReposInputSchema>) =>
    importAllProjectReposInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return importAllProjectReposImpl(data);
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
    await requireBackstageSession();
    return removeProjectRepoImpl(data.repoFullName);
  });

/**
 * Loads a backstage project with GitHub metadata, enrichment output, and README HTML.
 */
export const getBackstageProjectDetail = createServerFn({ method: "GET" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return getBackstageProjectDetailImpl(data.repoFullName);
  });
