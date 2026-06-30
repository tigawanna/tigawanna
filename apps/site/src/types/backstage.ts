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
  repos: BackstageGithubRepo[];
  errors: string[];
};

export type BackstageProjectWithGithub = {
  project: BackstageProject;
  isPrivate: boolean | null;
};

export type BackstageGithubRepoWithTracking = {
  repo: BackstageGithubRepo;
  isTracked: boolean;
};
