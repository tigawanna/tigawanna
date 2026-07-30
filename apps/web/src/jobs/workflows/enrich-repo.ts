import type { WorkflowConfig } from "payload";

/**
 * Stub: enrich one repo as fetch → write so write failures don’t re-hit GitHub.
 * Implemented in plan step 4 (`tasks.fetchArtifacts` → `tasks.writeEnrichment`).
 */
export const enrichRepoWorkflow = {
  slug: "enrichRepo",
  label: "Enrich GitHub repository",
  queue: "github-enrich",
  retries: 3,
  inputSchema: [
    {
      name: "nameWithOwner",
      type: "text",
      required: true,
    },
  ],
  handler: async () => {
    // No-op until step 4 wires fetchArtifacts → writeEnrichment.
  },
} as const satisfies WorkflowConfig<{
  nameWithOwner: string;
}>;
