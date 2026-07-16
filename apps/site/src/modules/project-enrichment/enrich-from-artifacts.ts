import { getDb } from "@/lib/db/get-db.server";
import { getServerEnv } from "@/lib/envs/server-env";
import { enrichRepoFromArtifacts } from "@repo/ai";
import type { SpelunkPayload } from "@repo/github";
import { eq, projectEnrichmentOutputs } from "@repo/db";
import { hasPendingSuggestion, loadRepoArtifacts } from "./artifact-queries";
import type { RepoProcessDelta } from "./counters";
import { isRepoMetadataComplete, type GithubRepoSnapshot } from "./github-client";
import {
  persistEnrichmentOutput,
  supersedePendingSuggestions,
  writeEnrichmentSuggestion,
} from "./persist-enrichment";
import { syncRepoSnapshot } from "./sync-repo-snapshot";

export type EnrichRepoResult = RepoProcessDelta & {
  status: "enriched" | "skipped";
  reason?: string;
};

function skipped(reason: string): EnrichRepoResult {
  return {
    status: "skipped",
    reason,
    reposSynced: 0,
    reposSkipped: 1,
    reposEnriched: 0,
  };
}

/**
 * Enriches from DB artifacts only (never calls GitHub). Writes outputs + suggestion.
 */
export async function enrichFromArtifacts(
  runId: string,
  repo: GithubRepoSnapshot,
  force: boolean,
): Promise<EnrichRepoResult> {
  if (isRepoMetadataComplete(repo) && !force) {
    await syncRepoSnapshot(repo, "complete");
    return skipped("metadata_complete");
  }

  const artifacts = await loadRepoArtifacts(repo.id);
  if (!artifacts) {
    return skipped("no_artifacts");
  }

  const db = getDb();
  const existingOutput = await db
    .select()
    .from(projectEnrichmentOutputs)
    .where(eq(projectEnrichmentOutputs.githubRepoId, repo.id))
    .limit(1);

  if (!force && existingOutput[0]?.sourceGeneration === artifacts.generation) {
    return skipped("same_generation");
  }

  if (!force && (await hasPendingSuggestion(repo.id))) {
    await syncRepoSnapshot(repo, "pending_review");
    return skipped("pending_review");
  }

  if (force) {
    await supersedePendingSuggestions(repo.id);
  }

  return runEnrichment(runId, repo, artifacts.generation, artifacts.payload);
}

async function runEnrichment(
  runId: string,
  repo: GithubRepoSnapshot,
  sourceGeneration: number,
  spelunkPayload: SpelunkPayload,
): Promise<EnrichRepoResult> {
  const env = getServerEnv();
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const enrichment = await enrichRepoFromArtifacts(repo, spelunkPayload, {
    apiKey,
    model: env.OPENROUTER_MODEL ?? undefined,
  });
  const now = new Date();

  await persistEnrichmentOutput(repo.id, sourceGeneration, enrichment, now);
  await writeEnrichmentSuggestion(runId, repo, enrichment, spelunkPayload, sourceGeneration, now);

  return {
    status: "enriched",
    reposSynced: 0,
    reposSkipped: 0,
    reposEnriched: 1,
  };
}
