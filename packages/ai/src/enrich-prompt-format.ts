import type { RepoArtifact } from "@repo/github";
import type { EnrichRepoContext } from "./types.js";

export type PromptParts = {
  repo: EnrichRepoContext;
  isMonorepo: boolean;
  workspacePackages: RepoArtifact[];
  packageHomepage: string;
  topLevelFiles: string;
  dependencies: string[];
  devDependencies: string[];
  otherArtifacts: string;
};

/**
 * Formats the OpenRouter enrichment prompt from precomputed parts.
 */
export function formatEnrichPrompt(input: PromptParts) {
  const { repo, isMonorepo, workspacePackages } = input;
  const workspaceSection = isMonorepo ? workspacePackages.map((a) => a.summary).join("\n\n") : "";

  const monorepoRules = isMonorepo
    ? `
- This is a monorepo with ${workspacePackages.length} workspace package(s). Include "monorepoPackages": an array with one entry per workspace package below.
- Each monorepoPackages entry must use the package folder path (e.g. "apps/site"), the package name from package.json when available, and a concise one-sentence description of what that package does.
- Do not include the root package.json in monorepoPackages.`
    : `
- Omit "monorepoPackages" or use an empty array — this is not a monorepo.`;

  const monorepoJsonShape = isMonorepo
    ? `,
  "monorepoPackages": [{ "path": "apps/example", "name": "@scope/example", "description": "one sentence" }]`
    : "";

  return `You enrich GitHub repository metadata. Return JSON only.

Repository: ${repo.nameWithOwner}
Current description: ${repo.description ?? "(empty)"}
Current topics: ${repo.topics.join(", ") || "(none)"}
Current homepage: ${repo.homepageUrl ?? "(empty)"}
Package homepage field: ${input.packageHomepage || "(none)"}
Top-level files: ${input.topLevelFiles || "(none)"}
Dependencies: ${input.dependencies.slice(0, 30).join(", ") || "(none)"}
Dev dependencies: ${input.devDependencies.slice(0, 20).join(", ") || "(none)"}
${isMonorepo ? `\nWorkspace packages:\n${workspaceSection}` : ""}
${input.otherArtifacts ? `\nOther manifests:\n${input.otherArtifacts}` : ""}

Rules:
- Write a concise, accurate description (1-2 sentences) for the repository as a whole.
- Suggest 3-8 lowercase GitHub topics relevant to the stack and purpose.
- Only suggest homepage if package.json homepage exists or README/deploy config strongly implies a URL. Otherwise use empty string.
- Do not invent deployment URLs.${monorepoRules}

JSON shape:
{
  "description": "string",
  "topics": ["string"],
  "homepage": "https://..." | "",
  "confidence": { "description": 0-1, "topics": 0-1, "homepage": 0-1 },
  "reasoning": "short string"${monorepoJsonShape}
}`;
}
