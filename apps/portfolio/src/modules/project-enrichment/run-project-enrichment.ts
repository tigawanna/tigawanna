import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { getServerEnv } from "@/lib/envs/server-env";
import { sumDeltas, type RepoProcessDelta } from "@/modules/project-enrichment/counters";
import { enrichFromArtifacts } from "@/modules/project-enrichment/enrich-from-artifacts";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
  type GithubRepoSnapshot,
} from "@/modules/project-enrichment/github-client";
import {
  updateRunFailure,
  updateRunProgress,
  updateRunSuccess,
} from "@/modules/project-enrichment/run-records";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { spelunkRepo } from "@/modules/project-enrichment/spelunk-repo";

/**
 * Resolves target repos from enrichment params (by name or recent GitHub activity).
 */
async function fetchTargetRepos(params: EnrichmentRunParams) {
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

/**
 * Collects GitHub artifacts into `project_repo_artifacts` for one repo.
 */
async function spelunkRepoForRun(runId: string, repo: GithubRepoSnapshot, force: boolean) {
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

/**
 * Enriches one repo from stored artifacts into suggestions and outputs.
 */
async function enrichRepoForRun(runId: string, repo: GithubRepoSnapshot, force: boolean) {
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

/**
 * Runs project enrichment synchronously on the server (no Vercel Workflow).
 */
export async function runProjectEnrichment(params: EnrichmentRunParams) {
  const deltas: RepoProcessDelta[] = [];
  const runSpelunk = params.runSpelunk !== false;
  const runEnrichment = params.runEnrichment !== false;
  const force = params.force ?? false;

  try {
    const repos = await fetchTargetRepos(params);

    for (const [index, repo] of repos.entries()) {
      if (runSpelunk) {
        deltas.push(await spelunkRepoForRun(params.runId, repo, force));
      }

      if (runEnrichment) {
        deltas.push(await enrichRepoForRun(params.runId, repo, force));
      }

      await updateRunProgress(params.runId, sumDeltas(deltas), index + 1);
    }

    await updateRunSuccess(params.runId, sumDeltas(deltas));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await updateRunFailure(params.runId, sumDeltas(deltas), message);
    throw error;
  }
}
