import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { getServerEnv } from "@/lib/envs/server-env";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
} from "@/modules/project-enrichment/github-client";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";

/**
 * Workflow step: resolve target repos from params (by name or recent).
 */
export async function fetchReposStep(params: EnrichmentRunParams) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId: params.runId,
    step: "fetchRepos",
    outcome: "started",
    trigger: params.trigger,
    force: params.force,
    repoCount: params.repos?.length,
  });

  try {
    const pat = getServerEnv().GH_PAT;
    if (!pat) {
      throw new Error("GH_PAT is not configured");
    }

    const repos =
      params.repos && params.repos.length > 0
        ? await fetchReposByFullNames(pat, params.repos)
        : await fetchRecentRepos(pat, params.limit ?? 100);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId: params.runId,
      step: "fetchRepos",
      outcome: "success",
      trigger: params.trigger,
      repoCount: repos.length,
    });

    return repos;
  } catch (err: unknown) {
    logEnrichmentError(params.runId, "fetchRepos", err, { trigger: params.trigger });
    throw err;
  }
}
