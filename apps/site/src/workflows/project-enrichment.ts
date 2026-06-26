import { sleep } from "workflow";
import { getServerEnv } from "@/lib/server-env";
import {
  fetchRecentRepos,
  fetchReposByFullNames,
  type GithubRepoSnapshot,
} from "@/lib/project-enrichment/github-client";
import {
  processRepoForRun,
  sumDeltas,
  updateRunFailure,
  updateRunSuccess,
} from "@/lib/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/lib/project-enrichment/types";

export async function enrichProjectsWorkflow(params: EnrichmentRunParams) {
  "use workflow";

  const deltas: Awaited<ReturnType<typeof processRepoForRun>>[] = [];

  try {
    const repos = await fetchReposStep(params);

    for (const repo of repos) {
      const delta = await processRepoStep(params.runId, repo, params.force ?? false);
      deltas.push(delta);
      await sleep("2s");
    }

    await finalizeRunStep(params.runId, sumDeltas(deltas));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await markRunFailedStep(params.runId, sumDeltas(deltas), message);
    throw error;
  }
}

async function fetchReposStep(params: EnrichmentRunParams) {
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

async function processRepoStep(runId: string, repo: GithubRepoSnapshot, force: boolean) {
  "use step";
  return processRepoForRun(runId, repo, force);
}

async function finalizeRunStep(runId: string, counters: ReturnType<typeof sumDeltas>) {
  "use step";
  await updateRunSuccess(runId, counters);
}

async function markRunFailedStep(
  runId: string,
  counters: ReturnType<typeof sumDeltas>,
  message: string,
) {
  "use step";
  await updateRunFailure(runId, counters, message);
}
