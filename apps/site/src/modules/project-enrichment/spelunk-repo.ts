import { getDb } from "@/lib/db/get-db";
import { getServerEnv } from "@/lib/envs/server-env";
import { CURRENT_COLLECTOR_VERSION, collectArtifacts, createGitHubClient } from "@repo/github";
import { eq, projectRepoArtifacts } from "@repo/db";
import type { RepoProcessDelta } from "./counters";
import type { GithubRepoSnapshot } from "./github-client";
import { syncRepoSnapshot } from "./sync-repo-snapshot";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type SpelunkRepoResult = RepoProcessDelta & {
  status: "collected" | "skipped";
  reason?: string;
  generation?: number;
};

/**
 * Returns true when existing artifacts are fresh enough to skip re-spelunk.
 */
export function shouldSkipSpelunk(
  row: { collectorVersion: string; createdAt: Date } | undefined,
  force: boolean,
) {
  if (force || !row) {
    return false;
  }
  if (row.collectorVersion !== CURRENT_COLLECTOR_VERSION) {
    return false;
  }
  return Date.now() - row.createdAt.getTime() < SEVEN_DAYS_MS;
}

/**
 * Collects GitHub artifacts and upserts `project_repo_artifacts` (bumps generation).
 */
export async function spelunkRepo(
  repo: GithubRepoSnapshot,
  force: boolean,
): Promise<SpelunkRepoResult> {
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }

  await syncRepoSnapshot(repo);

  const db = getDb();
  const existing = await db
    .select()
    .from(projectRepoArtifacts)
    .where(eq(projectRepoArtifacts.githubRepoId, repo.id))
    .limit(1);
  const previous = existing[0];

  if (shouldSkipSpelunk(previous, force)) {
    return {
      status: "skipped",
      reason: "fresh_artifacts",
      generation: previous?.generation,
      reposSynced: 0,
      reposSkipped: 1,
      reposEnriched: 0,
    };
  }

  const payload = await collectArtifacts(createGitHubClient(pat), repo);
  const generation = (previous?.generation ?? 0) + 1;
  const now = new Date();

  await db
    .insert(projectRepoArtifacts)
    .values({
      githubRepoId: repo.id,
      repoFullName: repo.nameWithOwner,
      generation,
      collectorVersion: CURRENT_COLLECTOR_VERSION,
      payload: JSON.stringify(payload),
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: projectRepoArtifacts.githubRepoId,
      set: {
        repoFullName: repo.nameWithOwner,
        generation,
        collectorVersion: CURRENT_COLLECTOR_VERSION,
        payload: JSON.stringify(payload),
        createdAt: now,
      },
    });

  return {
    status: "collected",
    generation,
    reposSynced: 1,
    reposSkipped: 0,
    reposEnriched: 0,
  };
}
