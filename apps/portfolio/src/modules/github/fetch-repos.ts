import {
  buildRepoSearchText,
  createGitHubClient,
  extractRepoTags,
  type FetchRecentReposOptions,
  type GithubRepoNode,
} from "@repo/github";
import { fetchRecentReposGraphql } from "@/modules/github/gql-queries";
import { getServerEnv } from "@/lib/envs/server-env";

export type {
  FetchRecentReposOptions,
  GithubRepoOrderField,
  GithubOrderDirection,
} from "@repo/github";

function requirePat() {
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return createGitHubClient(pat);
}

/**
 * Fetches recent public repositories for embedding index builds.
 */
export async function fetchRecentReposForIndexing() {
  return requirePat().getRecentReposForIndexing();
}

/**
 * Fetches the viewer's pinned GitHub repositories.
 */
export async function fetchPinnedReposFromGithub() {
  return requirePat().getPinnedRepos();
}

/**
 * Fetches the viewer's recent GitHub repositories via GraphQL.
 *
 * Uses raw `fetch` so org-scoped GraphQL errors surface as `errors` instead of
 * failing the whole request (Octokit throws on partial GraphQL error responses).
 */
export async function fetchRecentReposFromGithub(options: FetchRecentReposOptions = {}) {
  return fetchRecentReposGraphql(options);
}

export { buildRepoSearchText, extractRepoTags };
export type { GithubRepoNode };
