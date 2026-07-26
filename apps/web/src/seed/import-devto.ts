import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { editorConfigFactory } from "@payloadcms/richtext-lexical";
import { getPayload, type Payload } from "payload";

import { normalizeDevtoTags, stripDevtoFrontmatter } from "../lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "../lib/markdown-to-lexical";
import payloadConfig from "../payload.config";
import { upsertBlogBySlug } from "./upsert-blog";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

const DEVTO_USERNAME = process.env.DEVTO_USERNAME || "tigawanna";
const DEV_TO_KEY = process.env.DEV_TO_KEY;
const PER_PAGE = 30;

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

export type ImportDevtoResult = {
  expected: number;
  created: number;
  updated: number;
  failed: number;
  slugs: string[];
};

/**
 * Fetches JSON from the Dev.to / Forem API.
 */
async function devtoFetch<T>(url: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tigawanna-web-importer",
  };
  if (DEV_TO_KEY) {
    headers["api-key"] = DEV_TO_KEY;
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
 * Imports published Dev.to posts into Payload as `kind: post` blogs.
 *
 * Public username listing works without a key. Set `DEV_TO_KEY` only if you
 * need `/articles/me` (drafts) later.
 */
export async function importDevtoPosts(payload?: Payload): Promise<ImportDevtoResult> {
  const ownsPayload = !payload;
  const client = payload ?? (await getPayload({ config: payloadConfig }));
  const editorConfig = await editorConfigFactory.default({
    config: client.config,
  });

  client.logger.info(`Fetching Dev.to articles for @${DEVTO_USERNAME}…`);
  const listed = await listPublishedArticles(DEVTO_USERNAME);
  client.logger.info(`Found ${listed.length} public articles.`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  const slugs: string[] = [];

  for (const summary of listed) {
    client.logger.info(`  importing: ${summary.slug}`);
    try {
      const detail = await fetchArticleDetail(summary.id);
      const tags = normalizeDevtoTags(detail.tag_list ?? summary.tag_list);
      const markdown = detail.body_markdown?.trim()
        ? stripDevtoFrontmatter(detail.body_markdown)
        : `${detail.description}\n\n[Read on Dev.to](${detail.url})`;

      const content = markdownToLexicalWithCodeBlocks(markdown, editorConfig);

      const result = await upsertBlogBySlug(client, {
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
      client.logger.info(`    ${result} post: ${detail.slug}`);
    } catch (err: unknown) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      client.logger.error(`    failed ${summary.slug}: ${message}`);
    }

    // Be polite to the public API.
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  client.logger.info(
    `Dev.to import complete. expected=${listed.length} created=${created} updated=${updated} failed=${failed}`,
  );

  if (ownsPayload) await client.destroy();

  return { expected: listed.length, created, updated, failed, slugs };
}

const isDirectRun = process.argv[1]?.includes("import-devto");
if (isDirectRun) {
  await importDevtoPosts();
}
