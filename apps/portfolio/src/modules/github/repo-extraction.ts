export {
  getRootPackageJson,
  getWorkspacePackageChunks,
  isMonorepoExtraction,
  readmeHasDescription,
  readmeHasTags,
  summarizePackageJson,
  type PackageJsonChunk,
  type RepoExtraction,
} from "@repo/github";

import {
  createGitHubClient,
  fetchRepoExtraction as fetchRepoExtractionWithClient,
  type GithubRepoSnapshot,
} from "@repo/github";

/**
 * Fetches README and nested package.json files from a GitHub repository.
 */
export async function fetchRepoExtraction(token: string, repo: GithubRepoSnapshot) {
  return fetchRepoExtractionWithClient(createGitHubClient(token), repo);
}
