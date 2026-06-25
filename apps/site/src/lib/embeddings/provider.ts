import { DEFAULT_EMBEDDING_MODEL } from "@/types/ai-settings";

const BATCH_SIZE = 32;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENAI_BASE_URL = "https://api.openai.com/v1";

type EmbeddingResponse = {
  data: { embedding: number[]; index: number }[];
};

export type EmbeddingProviderOptions = {
  apiKey?: string;
  model?: string;
};

function getServerOpenAiKey() {
  return process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY ?? null;
}

export function hasEmbeddingProvider(options?: EmbeddingProviderOptions) {
  return Boolean(options?.apiKey?.trim() || getServerOpenAiKey());
}

function resolveEmbeddingConfig(options?: EmbeddingProviderOptions) {
  const byokKey = options?.apiKey?.trim();
  if (byokKey) {
    return {
      apiKey: byokKey,
      model: options?.model ?? DEFAULT_EMBEDDING_MODEL,
      baseUrl: OPENROUTER_BASE_URL,
      referer: process.env.FRONTEND_URL,
    };
  }

  const serverKey = getServerOpenAiKey();
  if (!serverKey) {
    return null;
  }

  const usesOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  return {
    apiKey: serverKey,
    model: process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
    baseUrl: usesOpenRouter
      ? OPENROUTER_BASE_URL
      : (process.env.OPENAI_BASE_URL ?? OPENAI_BASE_URL),
    referer: process.env.FRONTEND_URL,
  };
}

async function createEmbeddingBatch(
  inputs: string[],
  config: NonNullable<ReturnType<typeof resolveEmbeddingConfig>>,
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  if (config.referer) {
    headers["HTTP-Referer"] = config.referer;
  }

  const res = await fetch(`${config.baseUrl}/embeddings`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      input: inputs,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding request failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as EmbeddingResponse;
  return json.data.sort((left, right) => left.index - right.index).map((item) => item.embedding);
}

export async function createEmbeddings(inputs: string[], options?: EmbeddingProviderOptions) {
  const config = resolveEmbeddingConfig(options);
  if (!config) {
    throw new Error("No embedding provider configured");
  }

  if (inputs.length === 0) {
    return [];
  }

  const embeddings: number[][] = [];

  for (let index = 0; index < inputs.length; index += BATCH_SIZE) {
    const batch = inputs.slice(index, index + BATCH_SIZE);
    const batchEmbeddings = await createEmbeddingBatch(batch, config);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

export async function createEmbedding(input: string, options?: EmbeddingProviderOptions) {
  const [embedding] = await createEmbeddings([input], options);
  if (!embedding) {
    throw new Error("Embedding provider returned an empty result");
  }
  return embedding;
}
