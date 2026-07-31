import type { TaskConfig } from "payload";
import { createGitHubClient, RequestError } from "@repo/github";

import { ENRICH_429_DELAY_MS, GITHUB_ENRICH_QUEUE } from "@/jobs/queues";
import { requireGithubPat } from "@/modules/github/list-github-repos";
import { mapEnrichmentFields, type EnrichmentFields } from "@/modules/github/map-enrichment-fields";

/**
 * Fetches GitHub spelunk artifacts for one repo (no Payload writes).
 * On HTTP 429, re-queues `enrichRepo` with +20m wait and returns without throwing.
 */
export const fetchArtifactsTask = {
  slug: "fetchArtifacts",
  label: "Fetch GitHub artifacts",
  retries: 3,
  inputSchema: [
    {
      name: "nameWithOwner",
      type: "text",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "requeued",
      type: "checkbox",
      required: true,
    },
    {
      name: "enrichment",
      type: "json",
    },
  ],
  handler: async ({ input, req }) => {
    const nameWithOwner = input.nameWithOwner.trim();
    console.log("[fetchArtifacts] start", nameWithOwner);
    const client = createGitHubClient(requireGithubPat());

    try {
      const snapshots = await client.getRepoSnapshotsByFullNames([nameWithOwner]);
      const snapshot = snapshots[0];
      if (!snapshot) {
        throw new Error(`Repository not found or private: ${nameWithOwner}`);
      }

      const enrichment = await mapEnrichmentFields(client, snapshot);
      console.log("[fetchArtifacts] ok", {
        nameWithOwner,
        defaultBranch: enrichment.defaultBranch,
        isMonorepo: enrichment.isMonorepo,
        monorepoKind: enrichment.monorepoKind,
        packages: enrichment.packages?.length ?? 0,
        readmeChars: enrichment.readmeMarkdown?.length ?? 0,
      });
      return {
        output: {
          requeued: false,
          enrichment,
        },
      };
    } catch (err: unknown) {
      if (err instanceof RequestError && err.status === 429) {
        console.log("[fetchArtifacts] 429 — requeue in 20m", nameWithOwner);
        await req.payload.jobs.queue({
          workflow: "enrichRepo",
          queue: GITHUB_ENRICH_QUEUE,
          input: { nameWithOwner },
          waitUntil: new Date(Date.now() + ENRICH_429_DELAY_MS),
        });
        return {
          output: {
            requeued: true,
            enrichment: null,
          },
        };
      }
      console.error("[fetchArtifacts] failed", nameWithOwner, err);
      throw err;
    }
  },
} as const satisfies TaskConfig<{
  input: { nameWithOwner: string };
  output: { requeued: boolean; enrichment: EnrichmentFields | null };
}>;
