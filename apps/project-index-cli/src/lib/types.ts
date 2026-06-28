export type GithubRepoSnapshot = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  url: string;
  topics: string[];
  defaultBranch: string;
};

export type PackageJsonChunk = {
  path: string;
  content: Record<string, unknown>;
};

export type RepoExtraction = {
  filePaths: string[];
  readme: string | null;
  readmePath: string | null;
  packageJsonChunks: PackageJsonChunk[];
};

export type SourceEmbeddingKind = "readme" | "tags" | "package-json" | "summary";

export type SourceEmbedding = {
  kind: SourceEmbeddingKind;
  label: string;
  text: string;
  embedding: number[];
};

export type InferredMetadata = {
  description: string;
  topics: string[];
};

export type ProcessRepoResult =
  | { status: "skipped"; reason: string; repoFullName: string }
  | { status: "processed"; repoFullName: string; sourceCount: number; llmUsed: boolean }
  | { status: "failed"; repoFullName: string; error: string };

export type RunSummary = {
  total: number;
  processed: number;
  skipped: number;
  failed: number;
};
