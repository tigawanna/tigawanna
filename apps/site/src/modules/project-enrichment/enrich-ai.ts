import { enrichRepoFromArtifacts, type EnrichmentPayload } from "@repo/ai";
import { getServerEnv } from "@/lib/envs/server-env";
import type { RepoExtraction } from "@/modules/github/repo-extraction";
import type { SpelunkPayload } from "@repo/github";

export type { EnrichmentPayload as EnrichmentResult } from "@repo/ai";

/**
 * Converts legacy `RepoExtraction` (package.json chunks) into a SpelunkPayload.
 * Temporary bridge until the workflow writes `project_repo_artifacts` and enrich reads them.
 */
export function extractionToSpelunkPayload(extraction: RepoExtraction): SpelunkPayload {
  return {
    filePaths: extraction.filePaths,
    readme: extraction.readme,
    readmePath: extraction.readmePath,
    artifacts: extraction.packageJsonChunks.map((chunk) => ({
      language: "javascript" as const,
      kind: "package.json",
      path: chunk.path,
      summary: [
        `Package: ${chunk.path}`,
        typeof chunk.content.name === "string" ? `name: ${chunk.content.name}` : null,
        typeof chunk.content.description === "string"
          ? `description: ${chunk.content.description}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
      parsed: chunk.content,
    })),
  };
}

/**
 * Enriches repo metadata via `@repo/ai` (OpenRouter). Accepts legacy extraction for now.
 */
export async function enrichRepoMetadata(
  repo: {
    nameWithOwner: string;
    description: string | null;
    topics: string[];
    homepageUrl: string | null;
  },
  extraction: RepoExtraction,
): Promise<EnrichmentPayload> {
  const env = getServerEnv();
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return enrichRepoFromArtifacts(repo, extractionToSpelunkPayload(extraction), {
    apiKey,
    model: env.OPENROUTER_MODEL ?? undefined,
  });
}
