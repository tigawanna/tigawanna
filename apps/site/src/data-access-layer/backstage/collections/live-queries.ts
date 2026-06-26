import { eq, type InitialQueryBuilder } from "@tanstack/db";
import { backstageGithubReposCollection } from "./github-repos-collection";
import { backstageProjectsCollection } from "./projects-collection";

export function backstageProjectsWithGithubLiveQuery(q: InitialQueryBuilder) {
  return q
    .from({ projects: backstageProjectsCollection })
    .leftJoin({ github: backstageGithubReposCollection }, ({ projects, github }) =>
      eq(projects.repoFullName, github.nameWithOwner),
    )
    .select(({ projects, github }) => ({
      project: projects,
      isPrivate: github == null ? null : github.isPrivate,
    }));
}

export function backstageGithubReposWithTrackingLiveQuery(q: InitialQueryBuilder) {
  return q
    .from({ github: backstageGithubReposCollection })
    .leftJoin({ projects: backstageProjectsCollection }, ({ github, projects }) =>
      eq(github.nameWithOwner, projects.repoFullName),
    )
    .select(({ github, projects }) => ({
      repo: github,
      isTracked: projects != null,
    }));
}
