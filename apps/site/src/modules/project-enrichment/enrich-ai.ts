import { getServerEnv } from "@/lib/envs/server-env";
import { z } from "zod";
import type { GithubRepoSnapshot, RepoAnalysis } from "./github-client";

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
});

export type EnrichmentResult = z.infer<typeof enrichmentSchema>;

function buildPrompt(repo: GithubRepoSnapshot, analysis: RepoAnalysis) {
  const dependencies =
    analysis.packageJson && typeof analysis.packageJson.dependencies === "object"
      ? Object.keys(analysis.packageJson.dependencies as Record<string, string>)
      : [];

  const devDependencies =
    analysis.packageJson && typeof analysis.packageJson.devDependencies === "object"
      ? Object.keys(analysis.packageJson.devDependencies as Record<string, string>)
      : [];

  const packageHomepage =
    typeof analysis.packageJson?.homepage === "string" ? analysis.packageJson.homepage : "";

  const topLevelFiles = analysis.filePaths
    .filter((path) => !path.includes("/"))
    .slice(0, 40)
    .join(", ");

  return `You enrich GitHub repository metadata. Return JSON only.

Repository: ${repo.nameWithOwner}
Current description: ${repo.description ?? "(empty)"}
Current topics: ${repo.topics.join(", ") || "(none)"}
Current homepage: ${repo.homepageUrl ?? "(empty)"}
Package homepage field: ${packageHomepage || "(none)"}
Top-level files: ${topLevelFiles || "(none)"}
Dependencies: ${dependencies.slice(0, 30).join(", ") || "(none)"}
Dev dependencies: ${devDependencies.slice(0, 20).join(", ") || "(none)"}

Rules:
- Write a concise, accurate description (1-2 sentences).
- Suggest 3-8 lowercase GitHub topics relevant to the stack and purpose.
- Only suggest homepage if package.json homepage exists or README/deploy config strongly implies a URL. Otherwise use empty string.
- Do not invent deployment URLs.

JSON shape:
{
  "description": "string",
  "topics": ["string"],
  "homepage": "https://..." | "",
  "confidence": { "description": 0-1, "topics": 0-1, "homepage": 0-1 },
  "reasoning": "short string"
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
  repo: GithubRepoSnapshot,
  analysis: RepoAnalysis,
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
          content: buildPrompt(repo, analysis),
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

  return enrichmentSchema.parse(JSON.parse(extractJsonObject(content)));
}
