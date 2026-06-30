import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { indexRepoEmbedding } from "@/modules/backstage/index-repo-embedding";
import { getServerEnv } from "@/lib/envs/server-env";
import type { RunCounters } from "@/modules/project-enrichment/counters";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
  type GithubRepoSnapshot,
} from "@/modules/project-enrichment/github-client";
import {
  processRepoForRun,
  updateRunFailure,
  updateRunProgress,
  updateRunSuccess,
} from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";

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

export async function processRepoStep(runId: string, repo: GithubRepoSnapshot, force: boolean) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "processRepo",
    outcome: "started",
    repoFullName: repo.nameWithOwner,
    force,
  });

  try {
    const delta = await processRepoForRun(runId, repo, force);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "processRepo",
      outcome: delta.reposSkipped > 0 ? "skipped" : "success",
      repoFullName: repo.nameWithOwner,
      force,
      delta,
    });

    return delta;
  } catch (err: unknown) {
    logEnrichmentError(runId, "processRepo", err, { repoFullName: repo.nameWithOwner });
    throw err;
  }
}

export async function indexEmbeddingStep(
  runId: string,
  repo: GithubRepoSnapshot,
  options: { skipIfComplete?: boolean; force?: boolean },
) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "indexEmbedding",
    outcome: "started",
    repoFullName: repo.nameWithOwner,
    force: options.force,
  });

  try {
    const result = await indexRepoEmbedding({
      repoFullName: repo.nameWithOwner,
      skipIfComplete: options.skipIfComplete,
      force: options.force,
    });

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "indexEmbedding",
      outcome: result.status === "skipped" || result.status === "disabled" ? "skipped" : "success",
      repoFullName: repo.nameWithOwner,
      error: result.status !== "processed" ? result.reason : undefined,
    });

    return result;
  } catch (err: unknown) {
    logEnrichmentError(runId, "indexEmbedding", err, { repoFullName: repo.nameWithOwner });
    throw err;
  }
}

export async function updateRunProgressStep(
  runId: string,
  counters: RunCounters,
  processedRepoCount: number,
) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "updateRunProgress",
    outcome: "success",
    counters,
  });

  try {
    await updateRunProgress(runId, counters, processedRepoCount);
  } catch (err: unknown) {
    logEnrichmentError(runId, "updateRunProgress", err, { counters });
    throw err;
  }
}

export async function finalizeRunStep(runId: string, counters: RunCounters) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "finalizeRun",
    outcome: "started",
    counters,
  });

  try {
    await updateRunSuccess(runId, counters);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "finalizeRun",
      outcome: "success",
      counters,
    });
  } catch (err: unknown) {
    logEnrichmentError(runId, "finalizeRun", err, { counters });
    throw err;
  }
}

export async function markRunFailedStep(runId: string, counters: RunCounters, message: string) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "markRunFailed",
    outcome: "started",
    counters,
    error: message,
  });

  try {
    await updateRunFailure(runId, counters, message);

    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "markRunFailed",
      outcome: "failure",
      counters,
      error: message,
    });
  } catch (err: unknown) {
    logEnrichmentError(runId, "markRunFailed", err, { counters });
    throw err;
  }
}
