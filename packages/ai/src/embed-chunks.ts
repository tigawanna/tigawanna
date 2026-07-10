import type { SpelunkPayload } from "@repo/github";
import type { EnrichmentPayload } from "./schema.js";

export type EmbedChunk = {
  source: string;
  text: string;
};

/**
 * Builds text chunks for local embedding from spelunk + enrichment payloads.
 */
export function buildEmbedChunks(
  spelunk: SpelunkPayload,
  enrichment: EnrichmentPayload | null,
  meta: { nameWithOwner: string; topics: string[]; description: string | null },
): { embedText: string; chunks: EmbedChunk[] } {
  const chunks: EmbedChunk[] = [];

  if (spelunk.readme) {
    chunks.push({ source: "readme", text: spelunk.readme.slice(0, 8_000) });
  }

  for (const artifact of spelunk.artifacts) {
    chunks.push({ source: artifact.path, text: artifact.summary });
  }

  const topics = enrichment?.topics?.length ? enrichment.topics : meta.topics;
  if (topics.length > 0) {
    chunks.push({ source: "topics", text: topics.join(", ") });
  }

  const description = enrichment?.description ?? meta.description;
  const summaryLine = [meta.nameWithOwner, description, topics.join(", ")]
    .filter(Boolean)
    .join(" — ");

  chunks.push({ source: "summary", text: summaryLine });

  const embedText = chunks.map((c) => c.text).join("\n\n");
  return { embedText, chunks };
}
