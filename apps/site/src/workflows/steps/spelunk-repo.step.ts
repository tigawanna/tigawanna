import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import type { GithubRepoSnapshot } from "@/modules/project-enrichment/github-client";
import { spelunkRepo } from "@/modules/project-enrichment/spelunk-repo";

/**
 * Workflow step: collect GitHub artifacts into `project_repo_artifacts`.
 */
export async function spelunkRepoStep(runId: string, repo: GithubRepoSnapshot, force: boolean) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "spelunkRepo",
    outcome: "started",
    repoFullName: repo.nameWithOwner,
    force,
  });

  try {
    const result = await spelunkRepo(repo, force);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "spelunkRepo",
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
    logEnrichmentError(runId, "spelunkRepo", err, { repoFullName: repo.nameWithOwner });
    throw err;
  }
}
