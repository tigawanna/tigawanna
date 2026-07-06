import { getServerEnv } from "@/lib/envs/server-env";
import {
  getRootPackageJson,
  getWorkspacePackageChunks,
  isMonorepoExtraction,
  summarizePackageJson,
  type RepoExtraction,
} from "@/modules/github/repo-extraction";
import { z } from "zod";

const monorepoPackageSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).max(200),
});

const enrichmentSchema = z.object({
  description: z.string().min(1).max(350),
  topics: z.array(z.string().min(1).max(50)).min(1).max(10),
  homepage: z.url().optional().or(z.literal("")),
  confidence: z.object({
    description: z.number().min(0).max(1),
    topics: z.number().min(0).max(1),
    homepage: z.number().min(0).max(1),
  }),
  reasoning: z.string().max(500),
  monorepoPackages: z.array(monorepoPackageSchema).optional(),
});

export type MonorepoPackageDescription = z.infer<typeof monorepoPackageSchema>;
export type EnrichmentResult = z.infer<typeof enrichmentSchema>;

function buildPrompt(
  repo: {
    nameWithOwner: string;
    description: string | null;
    topics: string[];
    homepageUrl: string | null;
  },
  extraction: RepoExtraction,
) {
  const packageJson = getRootPackageJson(extraction.packageJsonChunks);
  const workspacePackages = getWorkspacePackageChunks(extraction.packageJsonChunks);
  const isMonorepo = isMonorepoExtraction(extraction);

  const dependencies =
    packageJson && typeof packageJson.dependencies === "object"
      ? Object.keys(packageJson.dependencies as Record<string, string>)
      : [];

  const devDependencies =
    packageJson && typeof packageJson.devDependencies === "object"
      ? Object.keys(packageJson.devDependencies as Record<string, string>)
      : [];

  const packageHomepage = typeof packageJson?.homepage === "string" ? packageJson.homepage : "";

  const topLevelFiles = extraction.filePaths
    .filter((path) => !path.includes("/"))
    .slice(0, 40)
    .join(", ");

  const workspaceSection = isMonorepo
    ? workspacePackages.map((chunk) => summarizePackageJson(chunk.path, chunk.content)).join("\n\n")
    : "";

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
Package homepage field: ${packageHomepage || "(none)"}
Top-level files: ${topLevelFiles || "(none)"}
Dependencies: ${dependencies.slice(0, 30).join(", ") || "(none)"}
Dev dependencies: ${devDependencies.slice(0, 20).join(", ") || "(none)"}
${isMonorepo ? `\nWorkspace packages:\n${workspaceSection}` : ""}

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

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return text.slice(start, end + 1);
}

export async function enrichRepoMetadata(
  repo: {
    nameWithOwner: string;
    description: string | null;
    topics: string[];
    homepageUrl: string | null;
  },
  extraction: RepoExtraction,
): Promise<EnrichmentResult> {
  const env = getServerEnv();
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: buildPrompt(repo, extraction),
        },
      ],
      temperature: 0.2,
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

  const parsed = enrichmentSchema.parse(JSON.parse(extractJsonObject(content)));

  if (!isMonorepoExtraction(extraction)) {
    return { ...parsed, monorepoPackages: undefined };
  }

  return parsed;
}
