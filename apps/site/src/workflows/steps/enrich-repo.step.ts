import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { enrichFromArtifacts } from "@/modules/project-enrichment/enrich-from-artifacts";
import type { GithubRepoSnapshot } from "@/modules/project-enrichment/github-client";

/**
 * Workflow step: enrich from DB artifacts (no GitHub) into outputs + suggestions.
 */
export async function enrichRepoStep(runId: string, repo: GithubRepoSnapshot, force: boolean) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "enrichRepo",
    outcome: "started",
    repoFullName: repo.nameWithOwner,
    force,
  });

  try {
    const result = await enrichFromArtifacts(runId, repo, force);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "enrichRepo",
      outcome: result.status === "skipped" ? "skipped" : "success",
      repoFullName: repo.nameWithOwner,
      force,
      error: result.reason,
      delta: {
        reposSynced: result.reposSynced,
        reposSkipped: result.reposSkipped,
        reposEnriched: result.reposEnriched,
      },
    });

    return result;
  } catch (err: unknown) {
    logEnrichmentError(runId, "enrichRepo", err, { repoFullName: repo.nameWithOwner });
    throw err;
  }
}
