import { getDb } from "@/lib/get-db";
import { getServerEnv } from "@/lib/server-env";
import {
  and,
  eq,
  projectEnrichmentRuns,
  projectEnrichmentSuggestions,
  projectRepos,
} from "@repo/db";
import { enrichRepoMetadata } from "./enrich-ai";
import {
  fetchRepoAnalysis,
  hasCustomSocialPreview,
  isRepoMetadataComplete,
  type GithubRepoSnapshot,
} from "./github-client";
import type { EnrichmentRunParams } from "./types";

type RunCounters = {
  reposSynced: number;
  reposSkipped: number;
  reposEnriched: number;
};

export type RepoProcessDelta = {
  reposSynced: number;
  reposSkipped: number;
  reposEnriched: number;
};

async function hasPendingSuggestion(db: ReturnType<typeof getDb>, githubRepoId: string) {
  const rows = await db
    .select({ id: projectEnrichmentSuggestions.id })
    .from(projectEnrichmentSuggestions)
    .where(
      and(
        eq(projectEnrichmentSuggestions.githubRepoId, githubRepoId),
        eq(projectEnrichmentSuggestions.status, "pending_review"),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

async function syncRepoSnapshot(
  db: ReturnType<typeof getDb>,
  repo: GithubRepoSnapshot,
  attendance: "complete" | "needs_enrichment" | "pending_review" | "applied",
) {
  const now = new Date();

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
      attendance,
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
        attendance,
        lastGithubSyncAt: now,
        updatedAt: now,
      },
    });
}

async function supersedePendingSuggestions(db: ReturnType<typeof getDb>, githubRepoId: string) {
  await db
    .update(projectEnrichmentSuggestions)
    .set({ status: "superseded", reviewedAt: new Date() })
    .where(
      and(
        eq(projectEnrichmentSuggestions.githubRepoId, githubRepoId),
        eq(projectEnrichmentSuggestions.status, "pending_review"),
      ),
    );
}

export async function processRepoForRun(
  runId: string,
  repo: GithubRepoSnapshot,
  force: boolean,
): Promise<RepoProcessDelta> {
  const env = getServerEnv();
  const pat = env.GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }

  const db = getDb();
  const complete = isRepoMetadataComplete(repo);

  if (complete && !force) {
    await syncRepoSnapshot(db, repo, "complete");
    return { reposSynced: 1, reposSkipped: 0, reposEnriched: 0 };
  }

  if (!force) {
    const pending = await hasPendingSuggestion(db, repo.id);
    if (pending) {
      await syncRepoSnapshot(db, repo, "pending_review");
      return { reposSynced: 0, reposSkipped: 1, reposEnriched: 0 };
    }
  } else {
    await supersedePendingSuggestions(db, repo.id);
  }

  const analysis = await fetchRepoAnalysis(pat, repo);
  const enrichment = await enrichRepoMetadata(repo, analysis);
  const suggestionId = crypto.randomUUID();

  await syncRepoSnapshot(db, repo, "pending_review");

  await db.insert(projectEnrichmentSuggestions).values({
    id: suggestionId,
    runId,
    githubRepoId: repo.id,
    status: "pending_review",
    suggestedDescription: enrichment.description,
    suggestedHomepage: enrichment.homepage || null,
    suggestedTopics: JSON.stringify(enrichment.topics),
    analysisSummary: JSON.stringify({
      confidence: enrichment.confidence,
      reasoning: enrichment.reasoning,
      filePathCount: analysis.filePaths.length,
      hasPackageJson: analysis.packageJson != null,
    }),
    createdAt: new Date(),
  });

  return { reposSynced: 0, reposSkipped: 0, reposEnriched: 1 };
}

export async function updateRunSuccess(runId: string, counters: RunCounters) {
  const db = getDb();
  await db
    .update(projectEnrichmentRuns)
    .set({
      status: "completed",
      reposSynced: counters.reposSynced,
      reposSkipped: counters.reposSkipped,
      reposEnriched: counters.reposEnriched,
      finishedAt: new Date(),
      error: null,
    })
    .where(eq(projectEnrichmentRuns.id, runId));
}

export async function updateRunFailure(runId: string, counters: RunCounters, message: string) {
  const db = getDb();
  await db
    .update(projectEnrichmentRuns)
    .set({
      status: "failed",
      reposSynced: counters.reposSynced,
      reposSkipped: counters.reposSkipped,
      reposEnriched: counters.reposEnriched,
      finishedAt: new Date(),
      error: message,
    })
    .where(eq(projectEnrichmentRuns.id, runId));
}

export function sumDeltas(deltas: RepoProcessDelta[]): RunCounters {
  return deltas.reduce(
    (totals, delta) => ({
      reposSynced: totals.reposSynced + delta.reposSynced,
      reposSkipped: totals.reposSkipped + delta.reposSkipped,
      reposEnriched: totals.reposEnriched + delta.reposEnriched,
    }),
    { reposSynced: 0, reposSkipped: 0, reposEnriched: 0 },
  );
}

export async function createRunRecord(
  trigger: EnrichmentRunParams["trigger"],
  targetRepos: string[] | null,
) {
  const db = getDb();
  const runId = crypto.randomUUID();

  await db.insert(projectEnrichmentRuns).values({
    id: runId,
    trigger,
    targetRepos: targetRepos ? JSON.stringify(targetRepos) : null,
    status: "running",
    startedAt: new Date(),
  });

  return runId;
}
