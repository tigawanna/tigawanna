import type { TaskConfig } from "payload";

/**
 * Stub: write enrichment fields to a Payload repository doc.
 * Wired into `enrichRepo` workflow in plan step 4.
 */
export const writeEnrichmentTask = {
  slug: "writeEnrichment",
  label: "Write repository enrichment",
  retries: 2,
  inputSchema: [
    {
      name: "nameWithOwner",
      type: "text",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "ok",
      type: "checkbox",
      required: true,
    },
  ],
  handler: async () => {
    return { output: { ok: false } };
  },
} as const satisfies TaskConfig<{
  input: { nameWithOwner: string };
  output: { ok: boolean };
}>;
