import type { TaskConfig } from "payload";

/**
 * Stub: list GitHub repos, upsert Payload metadata, enqueue staggered enrich jobs.
 * Implemented in plan step 3.
 */
export const listAndUpsertReposTask = {
  slug: "listAndUpsertRepos",
  label: "List and upsert GitHub repos",
  retries: 2,
  inputSchema: [],
  outputSchema: [
    { name: "upserted", type: "number", required: true },
    { name: "queuedEnrich", type: "number", required: true },
  ],
  handler: async () => {
    return {
      output: {
        upserted: 0,
        queuedEnrich: 0,
      },
    };
  },
} as const satisfies TaskConfig<{
  input: Record<string, never>;
  output: { upserted: number; queuedEnrich: number };
}>;
