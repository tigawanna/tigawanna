import type { SpelunkPayload } from "@repo/github";

/** Repo fields needed to build an enrichment prompt. */
export type EnrichRepoContext = {
  nameWithOwner: string;
  description: string | null;
  topics: string[];
  homepageUrl: string | null;
};

/** Caller-supplied OpenRouter config (no env reads inside `@repo/ai`). */
export type EnrichRepoConfig = {
  apiKey: string;
  model?: string;
};

export type { SpelunkPayload };
