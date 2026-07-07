export {
  createGitHubClient,
  hasCustomSocialPreview,
  isRepoMetadataComplete,
  type GithubRepoSnapshot,
  type RepoAnalysis,
} from "@repo/github";

import {
  createGitHubClient,
  fetchRepoAnalysis as fetchRepoAnalysisWithClient,
  type GithubRepoSnapshot,
} from "@repo/github";

/**
 * Fetches recent public repository snapshots for enrichment.
 */
export async function fetchRecentRepos(token: string, limit: number) {
  return createGitHubClient(token).getRecentRepoSnapshots(limit);
}

/**
 * Fetches repository snapshots by full name for enrichment.
 */
export async function fetchReposByFullNames(token: string, fullNames: string[]) {
  return createGitHubClient(token).getRepoSnapshotsByFullNames(fullNames);
}

/**
 * Fetches file paths and root package.json for lightweight repo analysis.
 */
export async function fetchRepoAnalysis(token: string, repo: GithubRepoSnapshot) {
  return fetchRepoAnalysisWithClient(createGitHubClient(token), repo);
}
