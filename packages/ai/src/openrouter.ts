const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

export type OpenRouterChatOptions = {
  apiKey: string;
  model: string;
  prompt: string;
  temperature?: number;
};

/**
 * Calls OpenRouter chat completions and returns the assistant message content.
 */
export async function openRouterChatCompletion(options: OpenRouterChatOptions) {
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
export function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return text.slice(start, end + 1);
}
