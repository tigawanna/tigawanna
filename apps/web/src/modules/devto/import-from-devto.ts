import type { Payload, TypedUser } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { normalizeDevtoTags, stripDevtoFrontmatter } from "@/lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";
import { upsertBlogBySlug } from "@/seed/upsert-blog";

const PER_PAGE = 30;
const DEFAULT_DEVTO_USERNAME = "tigawanna";

export type ImportFromDevtoResult = {
  username: string;
  expected: number;
  created: number;
  updated: number;
  failed: number;
  slugs: string[];
};

type DevtoListArticle = {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  published_at: string;
  tag_list: string[] | string;
  cover_image: string | null;
};

type DevtoArticleDetail = DevtoListArticle & {
  body_markdown: string;
  tag_list: string[];
};

type ImportOpOptions = {
  user?: TypedUser | null;
  /** Dev.to username to import from (default: DEVTO_USERNAME or tigawanna). */
  username?: string;
};

/**
 * Resolves which Dev.to username to import published articles from.
 */
function resolveDevtoUsername(explicit?: string): string {
  const fromArg = explicit?.trim();
  if (fromArg) return fromArg;
  const fromEnv = process.env.DEVTO_USERNAME?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_DEVTO_USERNAME;
}

/**
 * Fetches JSON from the public Dev.to / Forem API (optional API key).
 */
async function devtoFetch<T>(url: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tigawanna-web-importer",
  };
  const apiKey = process.env.DEV_TO_KEY?.trim();
  if (apiKey) {
    headers["api-key"] = apiKey;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dev.to ${res.status} for ${url}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Lists published articles for a username (paginated public API).
 */
async function listPublishedArticles(username: string): Promise<DevtoListArticle[]> {
  const articles: DevtoListArticle[] = [];
  let page = 1;

  while (true) {
    const batch = await devtoFetch<DevtoListArticle[]>(
      `https://dev.to/api/articles?username=${encodeURIComponent(username)}&page=${page}&per_page=${PER_PAGE}`,
    );
    if (batch.length === 0) break;
    articles.push(...batch);
    if (batch.length < PER_PAGE) break;
    page += 1;
  }

  return articles;
}

/**
 * Loads full markdown body for one article.
 */
async function fetchArticleDetail(id: number): Promise<DevtoArticleDetail> {
  return devtoFetch<DevtoArticleDetail>(`https://dev.to/api/articles/${id}`);
}

/**
 * Busts Next.js blog list caches after a bulk import.
 */
function bustBlogCaches() {
  try {
    revalidateTag("blogs", "max");
    revalidateTag("landing-posts", "max");
    revalidatePath("/blogs");
    revalidatePath("/");
  } catch {
    // Outside of a Next.js request (e.g. payload run) — ignore.
  }
}

/**
 * Imports / re-imports published Dev.to posts into Payload as `kind: post` blogs.
 *
 * Idempotent by slug — safe to run from the Blogs list anytime (including production).
 * Public username listing works without `DEV_TO_KEY`.
 */
export async function importPostsFromDevto(
  payload: Payload,
  options: ImportOpOptions = {},
): Promise<ImportFromDevtoResult> {
  const username = resolveDevtoUsername(options.username);
  const editorConfig = await getContentEditorConfig(payload.config);

  payload.logger.info(`Fetching Dev.to articles for @${username}…`);
  const listed = await listPublishedArticles(username);
  payload.logger.info(`Found ${listed.length} public articles.`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  const slugs: string[] = [];

  for (const summary of listed) {
    payload.logger.info(`  importing: ${summary.slug}`);
    try {
      const detail = await fetchArticleDetail(summary.id);
      const tags = normalizeDevtoTags(detail.tag_list ?? summary.tag_list);
      const markdown = detail.body_markdown?.trim()
        ? stripDevtoFrontmatter(detail.body_markdown)
        : `${detail.description}\n\n[Read on Dev.to](${detail.url})`;

      const content = markdownToLexicalWithCodeBlocks(markdown, editorConfig);

      const result = await upsertBlogBySlug(payload, {
        title: detail.title,
        kind: "post",
        description: detail.description || detail.title,
        content,
        slug: detail.slug,
        tags: tags.map((tag) => ({ tag })),
        publishedAt: detail.published_at,
        coverUrl: detail.cover_image || summary.cover_image || undefined,
        _status: "published",
        devto: {
          enabled: true,
          status: "published",
          articleId: detail.id,
          url: detail.url,
          lastSyncedAt: new Date().toISOString(),
        },
      });

      if (result === "created") created += 1;
      else updated += 1;
      slugs.push(detail.slug);
      payload.logger.info(`    ${result} post: ${detail.slug}`);
    } catch (err: unknown) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      payload.logger.error(`    failed ${summary.slug}: ${message}`);
    }

    // Be polite to the public API.
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  bustBlogCaches();

  payload.logger.info(
    `Dev.to import complete. expected=${listed.length} created=${created} updated=${updated} failed=${failed}`,
  );

  return {
    username,
    expected: listed.length,
    created,
    updated,
    failed,
    slugs,
  };
}
