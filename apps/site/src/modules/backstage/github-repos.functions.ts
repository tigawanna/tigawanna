import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { extractRepoTags, fetchRecentReposFromGithub } from "@/modules/github/fetch-repos";
import { getServerEnv } from "@/lib/envs/server-env";
import { removeProjectRepo } from "@/modules/backstage/projects.functions";
import { deleteGithubRepo, setGithubRepoVisibility } from "@/modules/github/repo-admin";
import type { GithubRepoNode } from "@/types/github";
import type { BackstageGithubRepo } from "@/types/backstage";
import {
  buildPaginatedResponse,
  normalizePaginationParams,
  type PaginatedResponse,
} from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const repoFullNameSchema = z.string().regex(/^[^/]+\/[^/]+$/);

/**
 * Maps a GitHub GraphQL repository node to the backstage repo list shape.
 *
 * @param repo - Repository node from the GitHub API.
 */
function mapRepoNode(repo: GithubRepoNode): BackstageGithubRepo {
  return {
    id: repo.nameWithOwner,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description ?? null,
    homepageUrl: repo.homepageUrl ?? null,
    url: repo.url,
    openGraphImageUrl: repo.openGraphImageUrl ?? null,
    pushedAt: repo.pushedAt,
    isPrivate: repo.isPrivate,
    isFork: repo.isFork ?? false,
    isArchived: repo.isArchived ?? false,
    stargazerCount: repo.stargazerCount ?? 0,
    forkCount: repo.forkCount ?? 0,
    topics: extractRepoTags(repo),
  };
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

const listGithubReposInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
  })
  .optional();

/** Paginated GitHub repos plus any GraphQL error messages. */
export type BackstageGithubReposPage = PaginatedResponse<BackstageGithubRepo> & {
  errors: string[];
};

/**
 * Lists recent GitHub repositories for backstage import and management, paginated.
 *
 * Requires an authenticated admin session.
 */
export const listGithubReposForBackstage = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listGithubReposInputSchema>) =>
    listGithubReposInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<BackstageGithubReposPage> => {
    await requireBackstageSession();
    const { page, perPage, offset } = normalizePaginationParams(data ?? {});
    const result = await fetchRecentReposFromGithub({ first: Math.min(100, offset + perPage) });
    const nodes = (result.data?.viewer.repositories.nodes ?? []).filter(
      (repo): repo is GithubRepoNode => repo != null,
    );
    const allRepos = nodes.map(mapRepoNode);
    const paginated = buildPaginatedResponse({
      items: allRepos.slice(offset, offset + perPage),
      page,
      perPage,
      totalItems: allRepos.length,
    });

    return {
      ...paginated,
      errors: result.errors.map((error) => error.message),
    };
  });

/**
 * Deletes a repository on GitHub and removes its matching `project_repos` row.
 *
 * Requires an authenticated admin session.
 */
const deleteGithubRepoInputSchema = z.object({
  repoFullName: repoFullNameSchema,
  overridePat: z.string().min(1).optional(),
});

/**
 * Deletes a repository on GitHub and removes its matching `project_repos` row.
 *
 * When `overridePat` is provided, it is used instead of the server `GH_PAT`.
 * The override token is supplied by the client (typically from browser local storage)
 * and is never persisted server-side.
 *
 * Requires an authenticated admin session.
 */
export const deleteGithubRepoForBackstage = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof deleteGithubRepoInputSchema>) =>
    deleteGithubRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const pat = data.overridePat ?? requirePat();

    try {
      await deleteGithubRepo(pat, data.repoFullName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
    }

    await removeProjectRepo({ data: { repoFullName: data.repoFullName } });
    return { ok: true as const };
  });

/**
 * Changes a GitHub repository visibility between public and private.
 *
 * Requires an authenticated admin session.
 */
export const setGithubRepoVisibilityForBackstage = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string; visibility: "public" | "private" }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
    visibility: z.enum(["public", "private"]).parse(input.visibility),
  }))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    const pat = requirePat();
    await setGithubRepoVisibility(pat, data.repoFullName, data.visibility);
    return { ok: true as const, visibility: data.visibility };
  });
