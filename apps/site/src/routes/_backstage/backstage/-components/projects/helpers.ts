import type { BackstageProject } from "@/types/backstage";

export function attendanceLabel(attendance: string) {
  return attendance.replaceAll("_", " ");
}

/** High-contrast badge classes for projects awaiting enrichment approval. */
export const pendingReviewBadgeClass =
  "border-amber-400/60 bg-amber-950 text-amber-50 hover:bg-amber-900";

/**
 * Returns true when a project has AI enrichment suggestions waiting for approval.
 */
export function projectNeedsEnrichmentReview(project: BackstageProject) {
  return project.needsEnrichmentReview;
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
