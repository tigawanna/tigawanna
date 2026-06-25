import "@tanstack/react-start/server-only";

import { chat, type AnyTextAdapter, type ModelMessage, type StreamChunk } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { searchPortfolioReposToolDefinition } from "@/features/portfolio-ai/portfolio-search-tool-definitions";
import { searchPortfolioReposInternal } from "@/lib/portfolio/search-core";
import { serverEnv } from "@/lib/server-env";

function buildSystemPrompt() {
  return [
    "You are a portfolio guide for Dennis Waweru, a full-stack TypeScript developer based in Nairobi.",
    "Help visitors discover relevant GitHub projects from an indexed set of public repositories.",
    "Rules:",
    "- Always call search_portfolio_repos before recommending specific projects.",
    "- Ground answers in tool results. Never invent repositories, stacks, or features.",
    "- Be concise, warm, and practical. Mention repo names and why they match.",
    "- If nothing matches, suggest broader search terms the visitor can try.",
    "- Prefer recent or clearly relevant repos when scores are close.",
  ].join("\n\n");
}

function buildTextAdapter(apiKey: string | undefined, model: string | undefined): AnyTextAdapter {
  if (serverEnv.LMSTUDIO_BASE_URL) {
    const lmModel = serverEnv.LMSTUDIO_MODEL ?? "gemma-3-12b-it";
    return createOpenRouterText(lmModel as never, "lm-studio", {
      serverURL: serverEnv.LMSTUDIO_BASE_URL,
    }) as unknown as AnyTextAdapter;
  }

  if (!apiKey || !model) {
    throw new Error("apiKey and model are required when not using a local LM Studio server");
  }

  return createOpenRouterText(model as never, apiKey, {
    httpReferer: serverEnv.FRONTEND_URL,
  }) as unknown as AnyTextAdapter;
}

export async function streamPortfolioSearchChat(input: {
  messages: ModelMessage[];
  apiKey?: string;
  model?: string;
}): Promise<AsyncIterable<StreamChunk>> {
  const searchPortfolioRepos = searchPortfolioReposToolDefinition.server(async (toolInput) =>
    searchPortfolioReposInternal({
      query: toolInput.query,
      limit: typeof toolInput.limit === "number" ? toolInput.limit : 6,
      apiKey: input.apiKey,
    }),
  );

  return chat({
    adapter: buildTextAdapter(input.apiKey, input.model),
    messages: input.messages as never,
    systemPrompts: [buildSystemPrompt()],
    tools: [searchPortfolioRepos],
  });
}
