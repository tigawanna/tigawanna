export { buildEmbedChunks, type EmbedChunk } from "./embed-chunks.js";
export {
  buildEnrichPrompt,
  getPackageJsonArtifacts,
  getRootPackageParsed,
  getWorkspacePackageArtifacts,
  isMonorepoPayload,
} from "./enrich-prompt.js";
export { enrichRepoFromArtifacts } from "./enrich-repo.js";
export { extractJsonObject, openRouterChatCompletion } from "./openrouter.js";
export {
  enrichmentSchema,
  monorepoPackageSchema,
  type EnrichmentPayload,
  type MonorepoPackageDescription,
} from "./schema.js";
export type { EnrichRepoConfig, EnrichRepoContext, SpelunkPayload } from "./types.js";
