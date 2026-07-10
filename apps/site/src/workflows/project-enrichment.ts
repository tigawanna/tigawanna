import { sumDeltas } from "@/modules/project-enrichment/counters";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { sleep } from "workflow";
import {
  fetchReposStep,
  finalizeRunStep,
  markRunFailedStep,
  processRepoStep,
  updateRunProgressStep,
} from "./project-enrichment.steps";

export async function enrichProjectsWorkflow(params: EnrichmentRunParams) {
  "use workflow";

  const deltas: Awaited<ReturnType<typeof processRepoStep>>[] = [];
  const runEnrichment = params.runEnrichment !== false;

  try {
    const repos = await fetchReposStep(params);

    for (const [index, repo] of repos.entries()) {
      if (runEnrichment) {
        const delta = await processRepoStep(params.runId, repo, params.force ?? false);
        deltas.push(delta);
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
