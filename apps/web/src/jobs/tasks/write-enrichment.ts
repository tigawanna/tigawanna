import type { TaskConfig } from "payload";

import {
  parseEnrichmentFields,
  type EnrichmentFields,
} from "@/modules/github/map-enrichment-fields";

/**
 * Writes enrichment fields onto a Payload repository doc and sets `lastEnrichedAt`.
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
    {
      name: "enrichment",
      type: "json",
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
  handler: async ({ input, req }) => {
    const nameWithOwner = input.nameWithOwner.trim();
    const enrichment = parseEnrichmentFields(input.enrichment);

    const existing = await req.payload.find({
      collection: "repositories",
      where: { nameWithOwner: { equals: nameWithOwner } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const row = existing.docs[0];
    if (!row) {
      throw new Error(`Repository missing in Payload: ${nameWithOwner}`);
    }

    await req.payload.update({
      collection: "repositories",
      id: row.id,
      data: {
        defaultBranch: enrichment.defaultBranch,
        isMonorepo: enrichment.isMonorepo,
        monorepoKind: enrichment.monorepoKind,
        readmeMarkdown: enrichment.readmeMarkdown,
        packages: enrichment.packages,
        lastEnrichedAt: new Date().toISOString(),
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    });

    return { output: { ok: true } };
  },
} as const satisfies TaskConfig<{
  input: { nameWithOwner: string; enrichment: EnrichmentFields };
  output: { ok: boolean };
}>;
