import { getDb } from "@/lib/db/get-db.server";
import { projectRepos } from "@repo/db";
import {
  hasCustomSocialPreview,
  isRepoMetadataComplete,
  type GithubRepoSnapshot,
} from "./github-client";

type Attendance = "complete" | "needs_enrichment" | "pending_review" | "applied";

/**
 * Upserts a GitHub repo snapshot into `project_repos` (required before artifacts FK).
 */
export async function syncRepoSnapshot(repo: GithubRepoSnapshot, attendance?: Attendance) {
  const db = getDb();
  const now = new Date();
  const nextAttendance =
    attendance ?? (isRepoMetadataComplete(repo) ? "complete" : "needs_enrichment");

  await db
    .insert(projectRepos)
    .values({
      githubRepoId: repo.id,
      repoFullName: repo.nameWithOwner,
      currentDescription: repo.description,
      currentTopics: JSON.stringify(repo.topics),
      currentHomepage: repo.homepageUrl,
      currentOgImageUrl: repo.openGraphImageUrl,
      hasCustomSocialPreview: hasCustomSocialPreview(repo.openGraphImageUrl),
      attendance: nextAttendance,
      lastGithubSyncAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: projectRepos.githubRepoId,
      set: {
        repoFullName: repo.nameWithOwner,
        currentDescription: repo.description,
        currentTopics: JSON.stringify(repo.topics),
        currentHomepage: repo.homepageUrl,
        currentOgImageUrl: repo.openGraphImageUrl,
        hasCustomSocialPreview: hasCustomSocialPreview(repo.openGraphImageUrl),
        attendance: nextAttendance,
        lastGithubSyncAt: now,
        updatedAt: now,
      },
    });
}
