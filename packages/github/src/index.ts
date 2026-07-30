export { createGitHubClient, GitHubClient, RequestError } from "./client";
export {
  fetchRepoAnalysis,
  fetchRepoExtraction,
  getRootPackageJson,
  getWorkspacePackageChunks,
  isMonorepoExtraction,
  readmeHasDescription,
  readmeHasTags,
  summarizePackageJson,
} from "./extraction";
export {
  CURRENT_COLLECTOR_VERSION,
  collectArtifacts,
  discoverManifestCandidates,
  findReadmePath,
  parseManifest,
  parsePackageJson,
  repoArtifactLanguages,
} from "./spelunk/index";
export type {
  ManifestCandidate,
  RepoArtifact,
  RepoArtifactLanguage,
  SpelunkPayload,
} from "./spelunk/index";
export type {
  FetchRecentReposOptions,
  FetchRecentReposResult,
  GithubGraphqlError,
  GithubGraphqlRateLimit,
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
} from "./types";
export {
  buildRepoSearchText,
  extractRepoTags,
  filterRepoNodes,
  hasCustomSocialPreview,
  isRepoMetadataComplete,
  mapEnrichmentRepoNode,
  splitRepoFullName,
} from "./utils/repo";
