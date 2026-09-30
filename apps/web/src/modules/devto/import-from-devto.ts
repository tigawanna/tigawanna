import type { Payload, TypedUser } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import {
  normalizeDevtoTags,
  setDevtoCanonicalUrl,
  stripDevtoFrontmatter,
} from "@/lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";
import { getCanonicalSiteUrl, getSiteUrl } from "@/lib/site-url";
import type { Blog } from "@/payload-types";

/** Forem's max page size — one request covers most accounts. */
const PER_PAGE = 1000;
const DEFAULT_DEVTO_USERNAME = "tigawanna";
/** Parallel Dev.to fetch + Payload upsert workers. */
const DEFAULT_CONCURRENCY = 5;

export type ImportFromDevtoFailure = {
  slug: string;
  error: string;
};

export type ImportFromDevtoDuplicate = {
  /** Blog the import writes to. */
  slug: string;
  /** Other blogs pointing at the same Dev.to article — safe to delete. */
  duplicates: string[];
};

export type ImportFromDevtoResult = {
  username: string;
  /** Published articles listed on Dev.to. */
  expected: number;
  /** Already up to date (synced after the article's last edit). */
  skipped: number;
  created: number;
  updated: number;
  /** Dev.to articles whose `canonical_url` was pointed at this site. */
  canonicalUpdated: number;
  /** Failed this run — retried automatically on the next run. */
  failed: ImportFromDevtoFailure[];
  /** Pending articles not started before the time budget ran out. */
  remaining: number;
  /** Pre-existing duplicate blogs detected for listed articles. */
  duplicates: ImportFromDevtoDuplicate[];
  /** Echo back on follow-up calls so a chained run skips what it already did. */
  since: string;
};

type DevtoListArticle = {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  published_at: string;
  edited_at: string | null;
  canonical_url: string | null;
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
  /** Re-import articles even if unchanged since their last sync. */
  force?: boolean;
  /**
   * Articles synced at/after this ISO time count as done. Pass the previous
   * result's `since` so chained calls don't redo work.
   */
  since?: string;
  /** Stop starting new articles after this many ms (default: no limit). */
  timeBudgetMs?: number;
  concurrency?: number;
};

type ExistingBlog = {
  id: Blog["id"];
  slug: string;
  articleId: number | null;
  lastSyncedAt: string | null;
};

type BlogIndex = {
  bySlug: Map<string, ExistingBlog>;
  byArticleId: Map<number, ExistingBlog[]>;
};

type ImportPlan = {
  article: DevtoListArticle;
  /** Blog to update; `undefined` means create. */
  existing: ExistingBlog | undefined;
  /** Slug to save under — keeps the local slug for site-first posts. */
  slug: string;
  /** Desired Dev.to `canonical_url`, or `null` when we shouldn't manage it. */
  canonicalUrl: string | null;
  duplicates: string[];
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
async function devtoFetch<T>(url: string, apiKey: string | undefined): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tigawanna-web-importer",
  };
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
async function listPublishedArticles(
  username: string,
  apiKey: string | undefined,
): Promise<DevtoListArticle[]> {
  const articles: DevtoListArticle[] = [];
  let page = 1;

  while (true) {
    const batch = await devtoFetch<DevtoListArticle[]>(
      `https://dev.to/api/articles?username=${encodeURIComponent(username)}&page=${page}&per_page=${PER_PAGE}`,
      apiKey,
    );
    if (batch.length === 0) break;
    articles.push(...batch);
    if (batch.length < PER_PAGE) break;
    page += 1;
  }

  return articles;
}

/**
 * Indexes every blog (latest draft or published version) by slug and Dev.to article id.
 *
 * Uses `draft: true` because "Open on Dev.to" stores `devto.articleId` as a draft save.
 */
async function loadBlogIndex(payload: Payload): Promise<BlogIndex> {
  const { docs } = await payload.find({
    collection: "blogs",
    depth: 0,
    draft: true,
    pagination: false,
    overrideAccess: true,
    select: { slug: true, devto: { articleId: true, lastSyncedAt: true } },
  });

  const index: BlogIndex = { bySlug: new Map(), byArticleId: new Map() };
  for (const doc of docs) {
    if (!doc.slug) continue;
    const blog: ExistingBlog = {
      id: doc.id,
      slug: doc.slug,
      articleId: doc.devto?.articleId ?? null,
      lastSyncedAt: doc.devto?.lastSyncedAt ?? null,
    };
    index.bySlug.set(blog.slug, blog);
    if (blog.articleId !== null) {
      index.byArticleId.set(blog.articleId, [
        ...(index.byArticleId.get(blog.articleId) ?? []),
        blog,
      ]);
    }
  }
  return index;
}

/**
 * Lowercased hostname without a leading `www.`, or `null` for invalid URLs.
 */
function bareHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Normalizes a URL for comparison (trailing slash stripped).
 */
function normalizeUrl(url: string | null | undefined): string {
  return (url ?? "").trim().replace(/\/+$/, "");
}

/**
 * Extracts the blog slug when a canonical URL points at this site's `/blogs/{slug}`.
 */
function siteSlugFromCanonical(canonicalUrl: string | null, siteHost: string | null): string | null {
  if (!canonicalUrl || !siteHost || bareHost(canonicalUrl) !== siteHost) return null;
  const match = new URL(canonicalUrl).pathname.match(/^\/blogs\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Whether we may overwrite an article's canonical: unset, Dev.to's default, or already ours.
 * Canonicals pointing at some other site (e.g. a cross-post source) are left alone.
 */
function ownsCanonical(canonicalUrl: string | null, siteHost: string | null): boolean {
  if (!canonicalUrl?.trim()) return true;
  const host = bareHost(canonicalUrl);
  return host === "dev.to" || (siteHost !== null && host === siteHost);
}

/**
 * Picks the blog an article maps to — Dev.to id, then canonical slug, then Dev.to slug —
 * so site-first posts (local slug ≠ Dev.to slug) aren't imported twice.
 */
function planArticle(
  article: DevtoListArticle,
  index: BlogIndex,
  siteHost: string | null,
  canonicalOrigin: string | undefined,
): ImportPlan {
  const siteSlug = siteSlugFromCanonical(article.canonical_url, siteHost);
  const candidates = [
    ...(index.byArticleId.get(article.id) ?? []),
    siteSlug ? index.bySlug.get(siteSlug) : undefined,
    index.bySlug.get(article.slug),
  ].filter((blog, i, all): blog is ExistingBlog => !!blog && all.indexOf(blog) === i);

  const existing =
    candidates.find((blog) => siteSlug !== null && blog.slug === siteSlug) ??
    candidates.find((blog) => blog.articleId === article.id) ??
    candidates[0];
  const slug = existing?.slug ?? siteSlug ?? article.slug;
  const canonicalUrl =
    canonicalOrigin && ownsCanonical(article.canonical_url, siteHost)
      ? `${canonicalOrigin}/blogs/${slug}`
      : null;

  return {
    article,
    existing,
    slug,
    canonicalUrl,
    duplicates: candidates.filter((blog) => blog !== existing).map((blog) => blog.slug),
  };
}

/**
 * Whether Dev.to's canonical differs from the one we want to manage.
 */
function canonicalOutdated(current: string | null, desired: string | null): desired is string {
  return desired !== null && normalizeUrl(current) !== desired;
}

/**
 * Whether a planned article needs (re-)importing this run.
 */
function needsImport(plan: ImportPlan, since: number, force: boolean): boolean {
  const synced = Date.parse(plan.existing?.lastSyncedAt ?? "");
  if (Number.isNaN(synced)) return true;
  if (synced >= since) return false;
  if (force) return true;
  if (canonicalOutdated(plan.article.canonical_url, plan.canonicalUrl)) return true;
  return synced < Date.parse(plan.article.edited_at ?? plan.article.published_at);
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
 * Matches existing blogs by Dev.to id, then canonical URL, then slug (no duplicates for
 * site-first posts). Skips articles synced after their last Dev.to edit (unless `force`),
 * processes the rest with bounded concurrency, and stops starting new work once
 * `timeBudgetMs` elapses. When `DEV_TO_KEY` and an https `NEXT_PUBLIC_SITE_URL` are set,
 * points each article's Dev.to `canonical_url` at `/blogs/{slug}` on this site.
 * Failed and unstarted articles are picked up by the next run, so callers can loop
 * while `remaining > 0`.
 */
export async function importPostsFromDevto(
  payload: Payload,
  options: ImportOpOptions = {},
): Promise<ImportFromDevtoResult> {
  const startedAt = Date.now();
  const deadline = startedAt + (options.timeBudgetMs ?? Number.POSITIVE_INFINITY);
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const username = resolveDevtoUsername(options.username);
  const since = options.since ?? new Date(startedAt).toISOString();
  const apiKey = process.env.DEV_TO_KEY?.trim() || undefined;
  const canonicalOrigin = apiKey ? getCanonicalSiteUrl() : undefined;
  const siteHost = bareHost(getSiteUrl());

  const [editorConfig, listed, index] = await Promise.all([
    getContentEditorConfig(payload.config),
    listPublishedArticles(username, apiKey),
    loadBlogIndex(payload),
  ]);
  const plans = listed.map((article) => planArticle(article, index, siteHost, canonicalOrigin));
  const pending = plans.filter((plan) =>
    needsImport(plan, Date.parse(since), options.force ?? false),
  );

  payload.logger.info(
    `Dev.to @${username}: ${listed.length} listed, ${pending.length} to import${options.force ? " (forced)" : ""}.`,
  );

  let created = 0;
  let updated = 0;
  let canonicalUpdated = 0;
  const failed: ImportFromDevtoFailure[] = [];
  let next = 0;

  const syncCanonical = async (plan: ImportPlan, detail: DevtoArticleDetail) => {
    if (!apiKey || !canonicalOutdated(detail.canonical_url, plan.canonicalUrl)) return;
    try {
      const article = await setDevtoCanonicalUrl(apiKey, detail.id, plan.canonicalUrl);
      if (normalizeUrl(article.canonical_url) !== plan.canonicalUrl) {
        throw new Error("Dev.to kept its old value (front matter in the article body may override it)");
      }
      canonicalUpdated += 1;
      payload.logger.info(`  canonical → ${plan.canonicalUrl}`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      failed.push({ slug: plan.slug, error: `canonical_url: ${error}` });
      payload.logger.error(`  canonical failed ${plan.slug}: ${error}`);
    }
  };

  const importOne = async (plan: ImportPlan) => {
    const { article: summary } = plan;
    try {
      const detail = await devtoFetch<DevtoArticleDetail>(
        `https://dev.to/api/articles/${summary.id}`,
        apiKey,
      );
      // Before saving so `lastSyncedAt` lands after the `edited_at` bump from this PUT.
      await syncCanonical(plan, detail);

      const tags = normalizeDevtoTags(detail.tag_list ?? summary.tag_list);
      const markdown = detail.body_markdown?.trim()
        ? stripDevtoFrontmatter(detail.body_markdown)
        : `${detail.description}\n\n[Read on Dev.to](${detail.url})`;

      const data = {
        title: detail.title,
        kind: "post" as const,
        description: detail.description || detail.title,
        content: markdownToLexicalWithCodeBlocks(markdown, editorConfig),
        slug: plan.slug,
        generateSlug: false,
        tags: tags.map((tag) => ({ tag })),
        publishedAt: detail.published_at,
        coverUrl: detail.cover_image || summary.cover_image || undefined,
        _status: "published" as const,
        devto: {
          enabled: true,
          status: "published" as const,
          articleId: detail.id,
          url: detail.url,
          lastSyncedAt: new Date().toISOString(),
        },
      };

      if (plan.existing) {
        await payload.update({
          collection: "blogs",
          id: plan.existing.id,
          data,
          context: { disableRevalidate: true },
          overrideAccess: true,
        });
        updated += 1;
      } else {
        await payload.create({
          collection: "blogs",
          data,
          context: { disableRevalidate: true },
          overrideAccess: true,
        });
        created += 1;
      }
      payload.logger.info(`  ${plan.existing ? "updated" : "created"}: ${plan.slug}`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      failed.push({ slug: plan.slug, error });
      payload.logger.error(`  failed ${plan.slug}: ${error}`);
    }
  };

  const worker = async () => {
    while (next < pending.length && Date.now() < deadline) {
      const plan = pending[next];
      next += 1;
      await importOne(plan);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));

  if (created + updated > 0) bustBlogCaches();

  const result = {
    username,
    expected: listed.length,
    skipped: listed.length - pending.length,
    created,
    updated,
    canonicalUpdated,
    failed,
    remaining: pending.length - next,
    duplicates: plans
      .filter((plan) => plan.duplicates.length > 0)
      .map((plan) => ({ slug: plan.slug, duplicates: plan.duplicates })),
    since,
  } satisfies ImportFromDevtoResult;

  payload.logger.info(
    `Dev.to import run done in ${Date.now() - startedAt}ms: created=${created} updated=${updated} canonical=${canonicalUpdated} failed=${failed.length} remaining=${result.remaining} duplicates=${result.duplicates.length}`,
  );

  return result;
}
