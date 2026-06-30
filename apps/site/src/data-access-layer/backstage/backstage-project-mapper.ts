import type { BackstageProject } from "@/types/backstage";

type JoinedBackstageProject = BackstageProject & {
  readonly $collectionId?: string;
};

/**
 * Coalesces a nullable TanStack DB left-join project row into a backstage project.
 *
 * Left joins surface unmatched rows as objects with optional fields; this normalizes
 * them to `null` or a fully typed {@link BackstageProject}.
 *
 * @param project - Project row from a left join, or `null` when unmatched.
 */
export function nullableBackstageProject(
  project: Partial<JoinedBackstageProject> | null | undefined,
): BackstageProject | null {
  if (project?.githubRepoId == null || project.repoFullName == null) {
    return null;
  }

  return {
    githubRepoId: project.githubRepoId,
    repoFullName: project.repoFullName,
    currentDescription: project.currentDescription ?? null,
    currentTopics: project.currentTopics ?? [],
    currentHomepage: project.currentHomepage ?? null,
    currentOgImageUrl: project.currentOgImageUrl ?? null,
    hasCustomSocialPreview: project.hasCustomSocialPreview ?? false,
    attendance: project.attendance ?? "needs_enrichment",
    enrichedSummary: project.enrichedSummary ?? null,
    enrichedAt: project.enrichedAt ?? null,
    enrichedByAi: project.enrichedByAi ?? false,
    needsEnrichmentReview: project.needsEnrichmentReview ?? false,
    lastGithubSyncAt: project.lastGithubSyncAt ?? new Date(0),
    lastAppliedAt: project.lastAppliedAt ?? null,
    createdAt: project.createdAt ?? new Date(0),
    updatedAt: project.updatedAt ?? new Date(0),
  };
}
