import { getDb } from "@/lib/db/get-db";
import { eq, projectEnrichmentRuns } from "@repo/db";
import type { RunCounters } from "./counters";
import type { EnrichmentRunParams } from "./types";

/**
 * Creates a running enrichment run row and returns its id.
 */
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

/**
 * Persists in-flight workflow counters while a run is still `running`.
 */
export async function updateRunProgress(
  runId: string,
  counters: RunCounters,
  processedRepoCount: number,
) {
  const db = getDb();
  await db
    .update(projectEnrichmentRuns)
    .set({
      reposSynced: counters.reposSynced,
      reposSkipped: counters.reposSkipped,
      reposEnriched: counters.reposEnriched,
      processedRepoCount,
    })
    .where(eq(projectEnrichmentRuns.id, runId));
}

/**
 * Marks a run completed with final counters.
 */
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

/**
 * Marks a run failed with final counters and error message.
 */
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
