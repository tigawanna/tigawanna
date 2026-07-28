const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Cheap / writing-friendly OpenRouter models for the AI draft picker. */
export const OPENROUTER_CURATED_MODELS = [
  { id: "deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
] as const;

export const OPENROUTER_FALLBACK_MODELS = OPENROUTER_CURATED_MODELS.map((m) => m.id);

export type OpenRouterChatOptions = {
  apiKey: string;
  model: string;
  prompt: string;
  temperature?: number;
};

/**
 * Calls OpenRouter chat completions and returns the assistant message content.
 */
export async function openRouterChatCompletion(options: OpenRouterChatOptions): Promise<string> {
  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature ?? 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  return content;
}

/**
 * Extracts the outermost JSON object substring from model text.
 */
export function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return text.slice(start, end + 1);
}

/**
 * Reads `OPENROUTER_API_KEY` or returns null when AI draft is unavailable.
 */
export function getOpenRouterApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return key || null;
}

/**
 * Reads `OPENROUTER_API_KEY` or throws a clear configuration error.
 */
export function requireOpenRouterApiKey(): string {
  const key = getOpenRouterApiKey();
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set. Add it to apps/web/.env to enable AI drafts.");
  }
  return key;
}

/**
 * Default model for AI drafts (`OPENROUTER_MODEL` or DeepSeek V4 Flash).
 */
export function getDefaultOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || OPENROUTER_CURATED_MODELS[0].id;
}

export type OpenRouterModelSummary = {
  id: string;
  name: string;
  contextLength: number | null;
};

/**
 * Returns curated OpenRouter models, ensuring the configured default is present.
 */
export function listCuratedOpenRouterModels(): OpenRouterModelSummary[] {
  const defaultModel = getDefaultOpenRouterModel();
  const models: OpenRouterModelSummary[] = OPENROUTER_CURATED_MODELS.map((m) => ({
    id: m.id,
    name: m.name,
    contextLength: null,
  }));

  if (!models.some((m) => m.id === defaultModel)) {
    models.unshift({ id: defaultModel, name: defaultModel, contextLength: null });
  }

  return models;
}
