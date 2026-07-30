import type { TaskConfig } from "payload";

/**
 * Stub: GitHub spelunk / README fetch for one repo (no Payload writes).
 * Wired into `enrichRepo` workflow in plan step 4.
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
