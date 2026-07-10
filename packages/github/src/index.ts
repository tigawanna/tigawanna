export { createGitHubClient, GitHubClient, RequestError } from "./client.js";
export {
  fetchRepoAnalysis,
  fetchRepoExtraction,
  getRootPackageJson,
  getWorkspacePackageChunks,
  isMonorepoExtraction,
  readmeHasDescription,
  readmeHasTags,
  summarizePackageJson,
} from "./extraction.js";
export {
  CURRENT_COLLECTOR_VERSION,
  collectArtifacts,
  discoverManifestCandidates,
  findReadmePath,
  parseManifest,
  parsePackageJson,
  repoArtifactLanguages,
} from "./spelunk/index.js";
export type {
  ManifestCandidate,
  RepoArtifact,
  RepoArtifactLanguage,
  SpelunkPayload,
} from "./spelunk/index.js";
export type {
  FetchRecentReposOptions,
  FetchRecentReposResult,
  GithubGraphqlError,
  GithubRepoDetail,
  GithubRepoNode,
  GithubRepoSnapshot,
  GithubRepoOrderField,
  GithubOrderDirection,
  PackageJsonChunk,
  PinnedViewerReposResponse,
  RepoAnalysis,
  RepoExtraction,
  GitTreeEntry,
  RepositoryTopic,
  ViewerPinnedRepo,
  ViewerPinnedRepoData,
  ViewerPinnedRepoError,
} from "./types.js";
export {
  buildRepoSearchText,
  extractRepoTags,
  filterRepoNodes,
  hasCustomSocialPreview,
  isRepoMetadataComplete,
  mapEnrichmentRepoNode,
  splitRepoFullName,
} from "./utils/repo.js";
