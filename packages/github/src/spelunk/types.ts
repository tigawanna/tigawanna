/** Parser-schema version stored on `project_repo_artifacts.collectorVersion`. */
export const CURRENT_COLLECTOR_VERSION = "1";

export const repoArtifactLanguages = [
  "javascript",
  "python",
  "go",
  "kotlin",
  "java",
  "rust",
  "csharp",
  "ruby",
  "php",
  "swift",
] as const;

export type RepoArtifactLanguage = (typeof repoArtifactLanguages)[number];

/**
 * Compact per-manifest summary produced by a language parser.
 * Stored in `project_repo_artifacts.payload` and consumed by enrich + embed.
 */
export type RepoArtifact = {
  language: RepoArtifactLanguage;
  kind: string;
  path: string;
  summary: string;
  parsed?: Record<string, unknown>;
};

/** Candidate manifest discovered from the git tree before content is fetched. */
export type ManifestCandidate = {
  language: RepoArtifactLanguage;
  kind: string;
  path: string;
};

/**
 * Versioned spelunk result persisted as JSON on `project_repo_artifacts.payload`.
 */
export type SpelunkPayload = {
  filePaths: string[];
  readme: string | null;
  readmePath: string | null;
  artifacts: RepoArtifact[];
};
