import type { GithubRepoDetail, GithubRepoNode } from "../types.js";

export type RecentReposGraphqlResponse = {
  viewer: {
    repositories: { nodes: (GithubRepoNode | null)[] };
  };
};

export type PinnedReposGraphqlResponse = {
  viewer: {
    pinnedItems: { nodes: (GithubRepoNode | null)[] };
  };
};

export type OneRepoGraphqlResponse = {
  repository: GithubRepoDetail | null;
};

export type EnrichmentRepoGraphqlNode = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  openGraphImageUrl: string | null;
  isPrivate: boolean;
  defaultBranchRef: { name: string } | null;
  repositoryTopics: {
    nodes: { topic: { name: string } }[];
  };
};

export type EnrichmentRecentReposGraphqlResponse = {
  viewer: {
    repositories: { nodes: (EnrichmentRepoGraphqlNode | null)[] };
  };
};

export type RepoByNameGraphqlResponse = {
  repository: EnrichmentRepoGraphqlNode | null;
};
