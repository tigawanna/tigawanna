import { z } from "zod";
import type { CliEnv } from "../env.js";
import type { GithubRepoSnapshot, InferredMetadata, RepoExtraction } from "./types.js";
import { summarizePackageJson } from "./github.js";

const MAX_TOPICS = 6;

const enrichmentSchema = z.object({
  description: z.string().min(1).max(350),
  topics: z.array(z.string().min(1).max(50)).min(1).max(MAX_TOPICS),
  reasoning: z.string().max(500),
});

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return text.slice(start, end + 1);
}

function buildPrompt(
  repo: GithubRepoSnapshot,
  extraction: RepoExtraction,
  needsDescription: boolean,
  needsTopics: boolean,
) {
  const packageSummaries = extraction.packageJsonChunks
    .map((chunk) => summarizePackageJson(chunk.path, chunk.content))
    .join("\n\n");

  return `You enrich GitHub repository metadata. Return JSON only.

Repository: ${repo.nameWithOwner}
Current description: ${repo.description ?? "(empty)"}
Current topics: ${repo.topics.join(", ") || "(none)"}
Needs description: ${needsDescription ? "yes" : "no"}
Needs topics: ${needsTopics ? "yes" : "no"}

README excerpt:
${extraction.readme?.slice(0, 4000) ?? "(none)"}

Package manifests:
${packageSummaries || "(none)"}

Rules:
- If needs description is yes, write a concise accurate description (1-2 sentences).
- If needs description is no, repeat the current description verbatim.
- If needs topics is yes, suggest ${MAX_TOPICS} or fewer lowercase GitHub topics based on README and package manifests.
- If needs topics is no, repeat the current topics array.
- Never exceed ${MAX_TOPICS} topics.
- Prefer stack and domain terms over generic words.

JSON shape:
{
  "description": "string",
  "topics": ["string"],
  "reasoning": "short string"
}`;
}

export async function inferMissingMetadata(
  env: CliEnv,
  repo: GithubRepoSnapshot,
  extraction: RepoExtraction,
  needsDescription: boolean,
  needsTopics: boolean,
): Promise<InferredMetadata> {
  if (!needsDescription && !needsTopics) {
    return {
      description: repo.description?.trim() ?? "",
      topics: repo.topics,
    };
  }

  const apiKey = env.openrouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required to infer missing description or topics");
  }

  console.log(
    `[llm] calling OpenRouter (${env.openrouterModel}) for ${repo.nameWithOwner} — needs description=${needsDescription}, needs topics=${needsTopics}`,
  );

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openrouterModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: buildPrompt(repo, extraction, needsDescription, needsTopics),
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

  const result = {
    description: needsDescription ? parsed.description.trim() : (repo.description?.trim() ?? ""),
    topics: needsTopics ? parsed.topics.slice(0, MAX_TOPICS) : repo.topics,
  };

  console.log(`[llm] ${repo.nameWithOwner} — inference complete`);
  if (needsDescription) {
    console.log(`[llm]   description: ${result.description.slice(0, 120)}${result.description.length > 120 ? "…" : ""}`);
  }
  if (needsTopics) {
    console.log(`[llm]   topics: ${result.topics.join(", ")}`);
  }
  console.log(`[llm]   reasoning: ${parsed.reasoning.slice(0, 120)}${parsed.reasoning.length > 120 ? "…" : ""}`);

  return result;
}

export function normalizeTopics(topics: string[]) {
  return [...new Set(topics.map((topic) => topic.trim().toLowerCase()).filter(Boolean))].slice(
    0,
    MAX_TOPICS,
  );
}
