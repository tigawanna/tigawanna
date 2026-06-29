import { requireAdminSession } from "@/modules/admin-auth/require-admin";
import { extractRepoTags, fetchRecentReposFromGithub } from "@/modules/github/fetch-repos";
import { deleteGithubRepo, setGithubRepoVisibility } from "@/modules/github/repo-admin";
import { removeProjectRepo } from "@/modules/backstage/projects.functions";
import { getServerEnv } from "@/lib/envs/server-env";
import type { GithubRepoNode } from "@/types/github";
import type { BackstageGithubRepo, BackstageGithubReposResponse } from "@/types/backstage";
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

/**
 * Lists recent GitHub repositories for backstage import and management.
 *
 * Requires an authenticated admin session.
 */
export const listGithubReposForBackstage = createServerFn({ method: "GET" }).handler(
  async (): Promise<BackstageGithubReposResponse> => {
    await requireAdminSession();
    const result = await fetchRecentReposFromGithub();
    const nodes = (result.data?.viewer.repositories.nodes ?? []).filter(
      (repo): repo is GithubRepoNode => repo != null,
    );

    return {
      repos: nodes.map(mapRepoNode),
      errors: result.errors.map((error) => error.message),
    };
  },
);

/**
 * Deletes a repository on GitHub and removes its matching `project_repos` row.
 *
 * Requires an authenticated admin session.
 */
export const deleteGithubRepoForBackstage = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();
    await deleteGithubRepo(pat, data.repoFullName);
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
    await requireAdminSession();
    const pat = requirePat();
    await setGithubRepoVisibility(pat, data.repoFullName, data.visibility);
    return { ok: true as const, visibility: data.visibility };
  });
