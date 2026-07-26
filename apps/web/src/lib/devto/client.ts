export type DevtoArticleWriteInput = {
  title: string;
  bodyMarkdown: string;
  description?: string;
  tags?: string[];
  canonicalUrl?: string;
  /** When false (default), create/update as a Dev.to draft. */
  published?: boolean;
  mainImage?: string | null;
};

export type DevtoArticle = {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  published: boolean;
  published_at: string | null;
  body_markdown: string;
  cover_image: string | null;
  tag_list: string[] | string;
  canonical_url?: string | null;
};

/**
 * Error thrown when the Dev.to / Forem API returns a non-OK response.
 */
export class DevtoApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string, action: string) {
    super(`Dev.to ${action} failed (${status}): ${body.slice(0, 300)}`);
    this.name = "DevtoApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Reads `DEV_TO_KEY` or throws a clear configuration error.
 */
export function requireDevtoApiKey(): string {
  const key = process.env.DEV_TO_KEY?.trim();
  if (!key) {
    throw new Error("DEV_TO_KEY is not set. Generate one at https://dev.to/settings/extensions");
  }
  return key;
}

/**
 * Normalizes Dev.to `tag_list` which is sometimes a CSV string on list endpoints.
 */
export function normalizeDevtoTags(tagList: string[] | string | null | undefined): string[] {
  if (!tagList) return [];
  if (Array.isArray(tagList)) return tagList.map((tag) => tag.trim()).filter(Boolean);
  return tagList
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Strips YAML front matter from Dev.to `body_markdown` when present.
 */
export function stripDevtoFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return markdown;
  return markdown.slice(end + 4).replace(/^\s+/, "");
}

/**
 * Builds the edit URL for a Dev.to article (author dashboard).
 */
export function getDevtoEditUrl(articleUrl: string): string {
  const trimmed = articleUrl.replace(/\/$/, "");
  return trimmed.endsWith("/edit") ? trimmed : `${trimmed}/edit`;
}

/**
 * Caps tags to Dev.to's limit of 4.
 */
function capTags(tags: string[] | undefined): string[] | undefined {
  if (!tags?.length) return undefined;
  return tags.slice(0, 4).map((tag) => tag.toLowerCase().replace(/\s+/g, ""));
}

type DevtoRequestInit = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  apiKey: string;
};

/**
 * Low-level authenticated Dev.to API request.
 */
async function devtoRequest<T>(path: string, init: DevtoRequestInit): Promise<T> {
  const res = await fetch(`https://dev.to/api${path}`, {
    method: init.method ?? "GET",
    headers: {
      Accept: "application/vnd.forem.api-v1+json",
      "Content-Type": "application/json",
      "api-key": init.apiKey,
      "User-Agent": "tigawanna-web-devto",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new DevtoApiError(res.status, body, `${init.method ?? "GET"} ${path}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Maps write input to the Forem article payload shape.
 *
 * Omits `published` when unset so updates do not accidentally unpublish.
 */
function toArticlePayload(input: DevtoArticleWriteInput) {
  return {
    article: {
      title: input.title,
      body_markdown: input.bodyMarkdown,
      ...(typeof input.published === "boolean" ? { published: input.published } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.canonicalUrl ? { canonical_url: input.canonicalUrl } : {}),
      ...(input.mainImage ? { main_image: input.mainImage } : {}),
      ...(capTags(input.tags) ? { tags: capTags(input.tags) } : {}),
    },
  };
}

/**
 * Creates a Dev.to article (draft by default) with optional canonical URL.
 */
export async function createDevtoArticle(
  apiKey: string,
  input: DevtoArticleWriteInput,
): Promise<DevtoArticle> {
  return devtoRequest<DevtoArticle>("/articles", {
    apiKey,
    method: "POST",
    body: toArticlePayload(input),
  });
}

/**
 * Updates an existing Dev.to article by numeric id.
 */
export async function updateDevtoArticle(
  apiKey: string,
  articleId: number,
  input: DevtoArticleWriteInput,
): Promise<DevtoArticle> {
  return devtoRequest<DevtoArticle>(`/articles/${articleId}`, {
    apiKey,
    method: "PUT",
    body: toArticlePayload(input),
  });
}

/**
 * Fetches a full article (including `body_markdown`) by id.
 * Requires an API key for unpublished drafts owned by the authenticated user.
 */
export async function fetchDevtoArticle(apiKey: string, articleId: number): Promise<DevtoArticle> {
  return devtoRequest<DevtoArticle>(`/articles/${articleId}`, { apiKey });
}
