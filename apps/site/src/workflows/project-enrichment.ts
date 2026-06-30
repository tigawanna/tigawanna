import { sumDeltas } from "@/modules/project-enrichment/counters";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";
import { sleep } from "workflow";
import {
  fetchReposStep,
  finalizeRunStep,
  indexEmbeddingStep,
  markRunFailedStep,
  processRepoStep,
} from "./project-enrichment.steps";

export async function enrichProjectsWorkflow(params: EnrichmentRunParams) {
  "use workflow";

  const deltas: Awaited<ReturnType<typeof processRepoStep>>[] = [];
  const runEnrichment = params.runEnrichment !== false;
  const runEmbedding = params.runEmbedding === true;

  try {
    const repos = await fetchReposStep(params);

    for (const repo of repos) {
      if (runEnrichment) {
        const delta = await processRepoStep(params.runId, repo, params.force ?? false);
        deltas.push(delta);
      }

      if (runEmbedding) {
        await indexEmbeddingStep(params.runId, repo, {
          skipIfComplete: params.skipEmbeddingIfComplete ?? true,
          force: params.forceEmbedding ?? false,
        });
      }

      await sleep("2s");
    }

    await finalizeRunStep(params.runId, sumDeltas(deltas));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await markRunFailedStep(params.runId, sumDeltas(deltas), message);
    throw error;
  }
}
