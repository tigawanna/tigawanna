import type { WorkflowConfig } from "payload";

import { GITHUB_ENRICH_QUEUE } from "@/jobs/queues";
import { parseEnrichmentFields } from "@/modules/github/map-enrichment-fields";

/**
 * Enrich one repo: fetch GitHub artifacts → write Payload fields.
 * Retries resume from the failed task (cached fetch output is reused).
 */
export const enrichRepoWorkflow = {
  slug: "enrichRepo",
  label: "Enrich GitHub repository",
  queue: GITHUB_ENRICH_QUEUE,
  retries: 3,
  inputSchema: [
    {
      name: "nameWithOwner",
      type: "text",
      required: true,
    },
  ],
  handler: async ({ job, tasks }) => {
    const nameWithOwner = job.input.nameWithOwner;
    console.log("[enrichRepo] start", nameWithOwner);

    const fetched = await tasks.fetchArtifacts("fetch-artifacts", {
      input: { nameWithOwner },
    });

    if (fetched.requeued || !fetched.enrichment) {
      console.log("[enrichRepo] stop early", {
        nameWithOwner,
        requeued: fetched.requeued,
        hasEnrichment: Boolean(fetched.enrichment),
      });
      return;
    }

    await tasks.writeEnrichment("write-enrichment", {
      input: {
        nameWithOwner,
        enrichment: parseEnrichmentFields(fetched.enrichment),
      },
    });

    console.log("[enrichRepo] done", nameWithOwner);
  },
} as const satisfies WorkflowConfig<{
  nameWithOwner: string;
}>;
