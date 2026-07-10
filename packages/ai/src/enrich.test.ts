import { describe, expect, it } from "vitest";
import { buildEmbedChunks } from "./embed-chunks.js";
import { buildEnrichPrompt, isMonorepoPayload } from "./enrich-prompt.js";
import { extractJsonObject } from "./openrouter.js";
import type { SpelunkPayload } from "./types.js";

const basePayload: SpelunkPayload = {
  filePaths: ["package.json", "README.md", "apps/web/package.json"],
  readme: "# App\n\nA demo app.",
  readmePath: "README.md",
  artifacts: [
    {
      language: "javascript",
      kind: "package.json",
      path: "package.json",
      summary: "Package: package.json\nname: root",
      parsed: { name: "root", dependencies: { react: "^19" } },
    },
    {
      language: "javascript",
      kind: "package.json",
      path: "apps/web/package.json",
      summary: "Package: apps/web/package.json\nname: web",
      parsed: { name: "web" },
    },
  ],
};

describe("enrich-prompt", () => {
  it("detects monorepos from workspace package.json artifacts", () => {
    expect(isMonorepoPayload(basePayload)).toBe(true);
    expect(
      isMonorepoPayload({
        ...basePayload,
        artifacts: [basePayload.artifacts[0]!],
      }),
    ).toBe(false);
  });

  it("includes workspace package summaries in the prompt", () => {
    const prompt = buildEnrichPrompt(
      {
        nameWithOwner: "acme/app",
        description: null,
        topics: [],
        homepageUrl: null,
      },
      basePayload,
    );
    expect(prompt).toContain("Workspace packages:");
    expect(prompt).toContain("apps/web/package.json");
  });
});

describe("openrouter helpers", () => {
  it("extracts a JSON object from surrounding text", () => {
    expect(extractJsonObject('prefix {"a":1} suffix')).toBe('{"a":1}');
  });
});

describe("embed-chunks", () => {
  it("builds chunks from spelunk + enrichment", () => {
    const { chunks, embedText } = buildEmbedChunks(
      basePayload,
      {
        description: "Demo monorepo",
        topics: ["react", "typescript"],
        homepage: "",
        confidence: { description: 0.9, topics: 0.8, homepage: 0.1 },
        reasoning: "ok",
      },
      { nameWithOwner: "acme/app", topics: [], description: null },
    );

    expect(chunks.some((c) => c.source === "readme")).toBe(true);
    expect(chunks.some((c) => c.source === "summary")).toBe(true);
    expect(embedText).toContain("Demo monorepo");
  });
});
