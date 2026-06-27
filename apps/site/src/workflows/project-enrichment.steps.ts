import { getServerEnv } from "@/lib/envs/server-env";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
  type GithubRepoSnapshot,
} from "@/modules/project-enrichment/github-client";
import type { RunCounters } from "@/modules/project-enrichment/counters";
import {
  processRepoForRun,
  updateRunFailure,
  updateRunSuccess,
} from "@/modules/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";

export async function fetchReposStep(params: EnrichmentRunParams) {
  "use step";

  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }

  if (params.repos && params.repos.length > 0) {
    return fetchReposByFullNames(pat, params.repos);
  }

  return fetchRecentRepos(pat, params.limit ?? 100);
}

export async function processRepoStep(runId: string, repo: GithubRepoSnapshot, force: boolean) {
  "use step";
  return processRepoForRun(runId, repo, force);
}

export async function finalizeRunStep(runId: string, counters: RunCounters) {
  "use step";
  await updateRunSuccess(runId, counters);
}

export async function markRunFailedStep(runId: string, counters: RunCounters, message: string) {
  "use step";
  await updateRunFailure(runId, counters, message);
}
