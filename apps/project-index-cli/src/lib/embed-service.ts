import { GemmaEmbedding } from "@kessler/gemma-embedding";
import type { CliEnv } from "../env.js";

const EMBEDDING_MODEL_ID = "embeddinggemma-300m";

let embeddingInstance: GemmaEmbedding | null = null;
let embeddingLoadPromise: Promise<void> | null = null;

export function getEmbeddingModelId() {
  return EMBEDDING_MODEL_ID;
}

function createEmbeddingInstance(env: CliEnv) {
  return new GemmaEmbedding(env.gemmaModelPath ? { modelPath: env.gemmaModelPath } : undefined);
}

export async function getGemmaEmbedding(env: CliEnv) {
  if (!embeddingInstance) {
    console.log("[embed] creating Gemma embedding instance…");
    embeddingInstance = createEmbeddingInstance(env);
  }

  if (embeddingInstance.isLoaded()) {
    return embeddingInstance;
  }

  if (!embeddingLoadPromise) {
    console.log("[embed] loading Gemma model (first embed will download if needed)…");
    embeddingLoadPromise = embeddingInstance.load().finally(() => {
      embeddingLoadPromise = null;
    });
  }

  await embeddingLoadPromise;
  console.log(`[embed] model ready (${EMBEDDING_MODEL_ID}, ${embeddingInstance.dimensions} dimensions)`);
  return embeddingInstance;
}

export async function unloadGemmaEmbedding() {
  if (embeddingInstance?.isLoaded()) {
    await embeddingInstance.unload();
  }
  embeddingInstance = null;
  embeddingLoadPromise = null;
}

export async function embedDocument(env: CliEnv, text: string, label?: string) {
  const preview = label ?? `${text.length} chars`;
  console.log(`[embed] embedding document: ${preview}`);
  const embedding = await getGemmaEmbedding(env);
  const vector = await embedding.embed(text, "document");
  console.log(`[embed] done: ${preview} → ${vector.length} dimensions`);
  return vector;
}
