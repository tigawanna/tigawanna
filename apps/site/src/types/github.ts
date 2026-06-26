export interface RepositoryTopic {
  topic: {
    name: string;
  };
}

export interface RequestError {
  path: string[];
  extensions: {
    code: string;
    typeName: string;
    fieldName: string;
  };
  locations: { line: number; column: number }[];
  message: string;
}

export interface GithubRepoNode {
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
}

export interface ViewerPinnedRepoData {
  viewer: {
    pinnedItems: { nodes: GithubRepoNode[] };
    repositories: { nodes: GithubRepoNode[] };
  };
}

export interface ViewerPinnedRepo {
  data: ViewerPinnedRepoData;
}

export interface ViewerPinnedRepoError {
  errors: RequestError[];
}

export type PinnedViewerReposResponse = ViewerPinnedRepo | ViewerPinnedRepoError;

export interface GithubRepoDetail {
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
}

export interface OneRepoGQL {
  data: { repository: GithubRepoDetail };
}
