import type { SpelunkPayload } from "@repo/github";
import { buildEnrichPrompt, isMonorepoPayload } from "./enrich-prompt.js";
import { extractJsonObject, openRouterChatCompletion } from "./openrouter.js";
import { enrichmentSchema, type EnrichmentPayload } from "./schema.js";
import type { EnrichRepoConfig, EnrichRepoContext } from "./types.js";

const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";

/**
 * Enriches repo metadata from a spelunk payload via OpenRouter (no GitHub, no DB).
 */
export async function enrichRepoFromArtifacts(
  repo: EnrichRepoContext,
  spelunkPayload: SpelunkPayload,
  config: EnrichRepoConfig,
): Promise<EnrichmentPayload> {
  if (!config.apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  const content = await openRouterChatCompletion({
    apiKey: config.apiKey,
    model: config.model ?? DEFAULT_MODEL,
    prompt: buildEnrichPrompt(repo, spelunkPayload),
  });

  const parsed = enrichmentSchema.parse(JSON.parse(extractJsonObject(content)));

  if (!isMonorepoPayload(spelunkPayload)) {
    return { ...parsed, monorepoPackages: undefined };
  }

  return parsed;
}
