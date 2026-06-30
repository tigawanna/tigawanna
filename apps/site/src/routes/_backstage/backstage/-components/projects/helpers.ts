import { BackstageGithubRepo, BackstageProject } from "@/types/backstage";

export function attendanceLabel(attendance: string) {
  return attendance.replaceAll("_", " ");
}

/**
 * Splits a GitHub `owner/repo` identifier into route params.
 */
export function splitBackstageProjectRoute(repoFullName: string) {
  const slash = repoFullName.indexOf("/");
  if (slash <= 0 || slash === repoFullName.length - 1) {
    return null;
  }

  return {
    owner: repoFullName.slice(0, slash),
    repo: repoFullName.slice(slash + 1),
  };
}

/**
 * Builds backstage project detail route params from a full repo name.
 */
export function backstageProjectDetailRoute(repoFullName: string) {
  const parts = splitBackstageProjectRoute(repoFullName);
  if (!parts) {
    return null;
  }

  return {
    to: "/backstage/projects/$owner/$repo" as const,
    params: parts,
  };
}

/**
 * Builds a backstage GitHub repo shape from an imported project when join data is missing.
 *
 * @param project - Imported project row from the database.
 */
export function githubRepoFromProject(project: BackstageProject): BackstageGithubRepo {
  const slash = project.repoFullName.lastIndexOf("/");
  const name = slash >= 0 ? project.repoFullName.slice(slash + 1) : project.repoFullName;

  return {
    id: project.repoFullName,
    name,
    nameWithOwner: project.repoFullName,
    description: project.currentDescription,
    homepageUrl: project.currentHomepage,
    url: `https://github.com/${project.repoFullName}`,
    openGraphImageUrl: project.currentOgImageUrl,
    pushedAt:
      typeof project.lastGithubSyncAt === "string"
        ? project.lastGithubSyncAt
        : project.lastGithubSyncAt.toISOString(),
    isPrivate: false,
    isFork: false,
    isArchived: false,
    stargazerCount: 0,
    forkCount: 0,
    topics: project.currentTopics,
  };
}

/**
 * Resolves GitHub repo list data from a join row, falling back to project fields.
 *
 * @param github - Optional GitHub repo from a TanStack DB join.
 * @param project - Imported project row used when join data is incomplete.
 */
export function resolveGithubRepo(
  github: Partial<BackstageGithubRepo> | null | undefined,
  project: BackstageProject,
): BackstageGithubRepo {
  const fallback = githubRepoFromProject(project);
  if (!github?.nameWithOwner) {
    return fallback;
  }

  return {
    id: github.id ?? github.nameWithOwner,
    name: github.name ?? fallback.name,
    nameWithOwner: github.nameWithOwner,
    description: github.description ?? fallback.description,
    homepageUrl: github.homepageUrl ?? fallback.homepageUrl,
    url: github.url ?? fallback.url,
    openGraphImageUrl: github.openGraphImageUrl ?? fallback.openGraphImageUrl,
    pushedAt: github.pushedAt ?? fallback.pushedAt,
    isPrivate: github.isPrivate ?? fallback.isPrivate,
    isFork: github.isFork ?? fallback.isFork,
    isArchived: github.isArchived ?? fallback.isArchived,
    stargazerCount: github.stargazerCount ?? fallback.stargazerCount,
    forkCount: github.forkCount ?? fallback.forkCount,
    topics: github.topics ?? fallback.topics,
  };
}
