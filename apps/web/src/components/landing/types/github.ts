export type RepositoryTopic = {
  topic: {
    name: string;
  };
};

/** GitHub GraphQL error shape used by landing fixtures/responses. */
export type GithubGraphqlError = {
  path: string[];
  extensions: {
    code: string;
    typeName: string;
    fieldName: string;
  };
  locations: { line: number; column: number }[];
  message: string;
};

/** Alias kept for parity with `@repo/github` naming in older landing code. */
export type RequestError = GithubGraphqlError;

/** Repository node returned by viewer pinned/recent GraphQL queries. */
export type GithubRepoNode = {
  name: string;
  url: string;
  openGraphImageUrl: string;
  description?: string;
  descriptionHTML: string;
  homepageUrl: string;
  nameWithOwner: string;
  pushedAt: string;
  isPrivate: boolean;
  isFork?: boolean;
  isArchived?: boolean;
  stargazerCount?: number;
  forkCount?: number;
  repositoryTopics: {
    nodes: RepositoryTopic[];
  };
};

export type ViewerPinnedRepoData = {
  viewer: {
    pinnedItems: { nodes: GithubRepoNode[] };
    repositories: { nodes: GithubRepoNode[] };
  };
};

export type ViewerPinnedRepo = {
  data: ViewerPinnedRepoData;
};

export type ViewerPinnedRepoError = {
  errors: GithubGraphqlError[];
};

export type PinnedViewerReposResponse = ViewerPinnedRepo | ViewerPinnedRepoError;

export type GithubRepoDetail = {
  createdAt: string;
  forkCount: number;
  id: string;
  homepageUrl: string;
  isPrivate: boolean;
  description: string;
  isFork: boolean;
  isEmpty: boolean;
  isTemplate: boolean;
  repositoryTopics: {
    edges: {
      node: {
        topic: { name: string };
      };
    }[];
  };
  name: string;
  nameWithOwner: string;
  openGraphImageUrl: string;
  updatedAt: string;
  url: string;
  languages: {
    edges: {
      size: number;
      node: { color: string; name: string };
    }[];
    totalSize: number;
  };
};

export type FetchRecentReposOptions = {
  first?: number;
  isFork?: boolean;
  orderField?: string;
  orderDirection?: string;
  cache?: RequestCache;
};

export type FetchRecentReposResult = {
  data: ViewerPinnedRepoData | null;
  errors: GithubGraphqlError[];
  rateLimit: unknown;
};

/** Compact repository snapshot used by enrichment and embedding pipelines. */
export type GithubRepoSnapshot = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  openGraphImageUrl: string | null;
  topics: string[];
  defaultBranch: string;
};

/** GraphQL response wrapper for a single repository detail query. */
export interface OneRepoGQL {
  data: { repository: GithubRepoDetail };
}
