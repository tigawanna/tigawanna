import { getDb } from "@/lib/db/get-db.server";
import type { EnrichmentPayload } from "@repo/ai";
import type { SpelunkPayload } from "@repo/github";
import {
  and,
  eq,
  projectEnrichmentOutputs,
  projectEnrichmentSuggestions,
  projectRepos,
} from "@repo/db";
import type { GithubRepoSnapshot } from "./github-client";
import { syncRepoSnapshot } from "./sync-repo-snapshot";

/**
 * Upserts `project_enrichment_outputs` for a repo generation.
 */
export async function persistEnrichmentOutput(
  githubRepoId: string,
  sourceGeneration: number,
  enrichment: EnrichmentPayload,
  now: Date,
) {
  const db = getDb();
  await db
    .insert(projectEnrichmentOutputs)
    .values({
      githubRepoId,
      sourceGeneration,
      payload: JSON.stringify(enrichment),
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: projectEnrichmentOutputs.githubRepoId,
      set: {
        sourceGeneration,
        payload: JSON.stringify(enrichment),
        createdAt: now,
      },
    });
}

/**
 * Inserts a pending_review suggestion and marks the repo pending.
 */
export async function writeEnrichmentSuggestion(
  runId: string,
  repo: GithubRepoSnapshot,
  enrichment: EnrichmentPayload,
  spelunkPayload: SpelunkPayload,
  sourceGeneration: number,
  now: Date,
) {
  const db = getDb();
  await syncRepoSnapshot(repo, "pending_review");

  await db.insert(projectEnrichmentSuggestions).values({
    id: crypto.randomUUID(),
    runId,
    githubRepoId: repo.id,
    status: "pending_review",
    suggestedDescription: enrichment.description,
    suggestedHomepage: enrichment.homepage || null,
    suggestedTopics: JSON.stringify(enrichment.topics),
    analysisSummary: JSON.stringify({
      confidence: enrichment.confidence,
      reasoning: enrichment.reasoning,
      sourceGeneration,
      filePathCount: spelunkPayload.filePaths.length,
      artifactCount: spelunkPayload.artifacts.length,
      monorepoPackages: enrichment.monorepoPackages,
    }),
    createdAt: now,
  });

  await db
    .update(projectRepos)
    .set({
      enrichedSummary: enrichment.reasoning,
      enrichedAt: now,
      enrichedByAi: true,
      updatedAt: now,
    })
    .where(eq(projectRepos.githubRepoId, repo.id));
}

/**
 * Marks pending suggestions as superseded (used when force re-enriching).
 */
export async function supersedePendingSuggestions(githubRepoId: string) {
  const db = getDb();
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
