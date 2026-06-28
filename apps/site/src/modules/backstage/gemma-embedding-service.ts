import { GemmaEmbedding } from "@kessler/gemma-embedding";

const EMBEDDING_MODEL_ID = "embeddinggemma-300m";

let embeddingInstance: GemmaEmbedding | null = null;
let embeddingLoadPromise: Promise<void> | null = null;

function createEmbeddingInstance() {
  const modelPath = process.env.GEMMA_MODEL_PATH;
  return new GemmaEmbedding(modelPath ? { modelPath } : undefined);
}

export async function getGemmaEmbedding() {
  if (!embeddingInstance) {
    embeddingInstance = createEmbeddingInstance();
  }

  if (embeddingInstance.isLoaded()) {
    return embeddingInstance;
  }

  if (!embeddingLoadPromise) {
    embeddingLoadPromise = embeddingInstance.load().finally(() => {
      embeddingLoadPromise = null;
    });
  }

  await embeddingLoadPromise;
  return embeddingInstance;
}

export function getEmbeddingModelId() {
  return EMBEDDING_MODEL_ID;
}

export async function unloadGemmaEmbedding() {
  if (embeddingInstance?.isLoaded()) {
    await embeddingInstance.unload();
  }
  embeddingInstance = null;
  embeddingLoadPromise = null;
}
