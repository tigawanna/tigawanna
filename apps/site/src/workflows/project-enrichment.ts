import { sumDeltas, type RepoProcessDelta } from "@/modules/project-enrichment/counters";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { sleep } from "workflow";
import { enrichRepoStep } from "./steps/enrich-repo.step";
import { fetchReposStep } from "./steps/fetch-repos.step";
import {
  finalizeRunStep,
  markRunFailedStep,
  updateRunProgressStep,
} from "./steps/run-progress.step";
import { spelunkRepoStep } from "./steps/spelunk-repo.step";

export async function enrichProjectsWorkflow(params: EnrichmentRunParams) {
  "use workflow";

  const deltas: RepoProcessDelta[] = [];
  const runSpelunk = params.runSpelunk !== false;
  const runEnrichment = params.runEnrichment !== false;
  const force = params.force ?? false;

  try {
    const repos = await fetchReposStep(params);

    for (const [index, repo] of repos.entries()) {
      if (runSpelunk) {
        deltas.push(await spelunkRepoStep(params.runId, repo, force));
      }

      if (runEnrichment) {
        deltas.push(await enrichRepoStep(params.runId, repo, force));
      }

      await updateRunProgressStep(params.runId, sumDeltas(deltas), index + 1);
      await sleep("2s");
    }

    await finalizeRunStep(params.runId, sumDeltas(deltas));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await markRunFailedStep(params.runId, sumDeltas(deltas), message);
    throw error;
  }
}
