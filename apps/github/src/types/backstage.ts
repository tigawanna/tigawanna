import type { BackstageProject } from "@/modules/backstage/projects.functions";

export type { BackstageProject };

export type BackstageGithubRepo = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  url: string;
  openGraphImageUrl: string | null;
  pushedAt: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  topics: string[];
};

export type BackstageGithubReposResponse = {
  items: BackstageGithubRepo[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
  errors: string[];
};

export type BackstageGithubRepoListItem = {
  repo: BackstageGithubRepo;
  isImported: boolean;
};

/** @deprecated Use {@link BackstageGithubRepoListItem} */
export type BackstageGithubRepoWithTracking = BackstageGithubRepoListItem;
