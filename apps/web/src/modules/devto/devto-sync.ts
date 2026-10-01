import type { Payload } from "payload";
import { slugify } from "payload/shared";
import { revalidatePath, revalidateTag } from "next/cache";

import type { getContentEditorConfig } from "@/lib/content-editor-config";
import {
  normalizeDevtoTags,
  setDevtoCanonicalUrl,
  stripDevtoFrontmatter,
} from "@/lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";
import { getCanonicalSiteUrl, getSiteUrl } from "@/lib/site-url";
import type { Blog, Series as SeriesDoc } from "@/payload-types";

/** Forem's max page size — one request covers most accounts. */
const PER_PAGE = 1000;
const DEFAULT_DEVTO_USERNAME = "tigawanna";

export type EditorConfig = Awaited<ReturnType<typeof getContentEditorConfig>>;

export type DevtoListArticle = {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  published_at: string;
  edited_at: string | null;
  canonical_url: string | null;
  /** Dev.to series id (the public API exposes no series name). */
  collection_id: number | null;
  /** Array on list responses, CSV string on detail responses. */
  tag_list: string[] | string;
  cover_image: string | null;
};

export type DevtoArticleDetail = DevtoListArticle & {
  body_markdown: string;
};

export type ExistingBlog = {
  id: Blog["id"];
  slug: string;
  title: string;
  status: "draft" | "published";
  articleId: number | null;
  lastSyncedAt: string | null;
  seriesId: SeriesDoc["id"] | null;
};

export type ExistingSeries = {
  id: SeriesDoc["id"];
  title: string;
  devtoCollectionId: number | null;
};

export type BlogIndex = {
  bySlug: Map<string, ExistingBlog>;
  byArticleId: Map<number, ExistingBlog[]>;
  series: ExistingSeries[];
};

export type ImportPlan = {
  article: DevtoListArticle;
  /** Blog to update; `undefined` means create. */
  existing: ExistingBlog | undefined;
  /** Slug to save under — keeps the local slug for site-first posts. */
  slug: string;
  /** Desired Dev.to `canonical_url`, or `null` when we shouldn't manage it. */
  canonicalUrl: string | null;
  /** Canonical points at some other site — left alone. */
  canonicalForeign: boolean;
  /** Existing blog isn't linked to the article's Dev.to series yet. */
  seriesOutdated: boolean;
  /** Other blogs pointing at the same article. */
  duplicates: ExistingBlog[];
};

/** Resolved env + site settings shared by every Dev.to sync operation. */
export type DevtoSyncContext = {
  payload: Payload;
  username: string;
  apiKey: string | undefined;
  /** Origin written into Dev.to canonicals; `undefined` disables canonical management. */
  canonicalOrigin: string | undefined;
  siteHost: string | null;
};

export type ImportArticleOutcome = {
  slug: string;
  action: "created" | "updated";
  canonical: "updated" | "unchanged" | "failed";
  canonicalError?: string;
  /** Dev.to `canonical_url` after this import. */
  canonicalUrl: string | null;
};

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
 * Builds the context from env: username, API key, and canonical origin.
 * Canonical management needs both `DEV_TO_KEY` and an https `NEXT_PUBLIC_SITE_URL`.
 */
export function createDevtoSyncContext(payload: Payload, username?: string): DevtoSyncContext {
  const apiKey = process.env.DEV_TO_KEY?.trim() || undefined;
  return {
    payload,
    username:
      username?.trim() || process.env.DEVTO_USERNAME?.trim() || DEFAULT_DEVTO_USERNAME,
    apiKey,
    canonicalOrigin: apiKey ? getCanonicalSiteUrl() : undefined,
    siteHost: bareHost(getSiteUrl()),
  };
}

/**
 * Fetches JSON from the Dev.to / Forem API (API key optional for public reads).
 */
async function devtoFetch<T>(ctx: DevtoSyncContext, url: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tigawanna-web-importer",
  };
  if (ctx.apiKey) headers["api-key"] = ctx.apiKey;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dev.to ${res.status} for ${url}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Lists published articles for the context username (paginated public API).
 */
export async function listPublishedArticles(ctx: DevtoSyncContext): Promise<DevtoListArticle[]> {
  const articles: DevtoListArticle[] = [];
  let page = 1;

  while (true) {
    const batch = await devtoFetch<DevtoListArticle[]>(
      ctx,
      `https://dev.to/api/articles?username=${encodeURIComponent(ctx.username)}&page=${page}&per_page=${PER_PAGE}`,
    );
    if (batch.length === 0) break;
    articles.push(...batch);
    if (batch.length < PER_PAGE) break;
    page += 1;
  }

  return articles;
}

/**
 * Loads one article including `body_markdown`.
 */
export async function fetchArticleDetail(
  ctx: DevtoSyncContext,
  articleId: number,
): Promise<DevtoArticleDetail> {
  return devtoFetch<DevtoArticleDetail>(ctx, `https://dev.to/api/articles/${articleId}`);
}

/**
 * Indexes every blog (latest draft or published version) by slug and Dev.to article id.
 *
 * Uses `draft: true` because "Open on Dev.to" stores `devto.articleId` as a draft save.
 */
export async function loadBlogIndex(payload: Payload): Promise<BlogIndex> {
  const [blogs, series] = await Promise.all([
    payload.find({
      collection: "blogs",
      depth: 0,
      draft: true,
      pagination: false,
      overrideAccess: true,
      select: {
        slug: true,
        title: true,
        _status: true,
        series: true,
        devto: { articleId: true, lastSyncedAt: true },
      },
    }),
    payload.find({
      collection: "series",
      depth: 0,
      pagination: false,
      overrideAccess: true,
      select: { title: true, devtoCollectionId: true },
    }),
  ]);

  const index: BlogIndex = {
    bySlug: new Map(),
    byArticleId: new Map(),
    series: series.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      devtoCollectionId: doc.devtoCollectionId ?? null,
    })),
  };

  for (const doc of blogs.docs) {
    if (!doc.slug) continue;
    const blog: ExistingBlog = {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      status: doc._status === "published" ? "published" : "draft",
      articleId: doc.devto?.articleId ?? null,
      lastSyncedAt: doc.devto?.lastSyncedAt ?? null,
      seriesId: typeof doc.series === "object" && doc.series ? doc.series.id : (doc.series ?? null),
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
 * Extracts the blog slug when a canonical URL points at this site's `/blogs/{slug}`.
 */
function siteSlugFromCanonical(canonicalUrl: string | null, siteHost: string | null): string | null {
  if (!canonicalUrl || !siteHost || bareHost(canonicalUrl) !== siteHost) return null;
  const match = new URL(canonicalUrl).pathname.match(/^\/blogs\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Whether we may overwrite an article's canonical: unset, Dev.to's default, or already ours.
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
export function planArticle(
  ctx: DevtoSyncContext,
  article: DevtoListArticle,
  index: BlogIndex,
): ImportPlan {
  const siteSlug = siteSlugFromCanonical(article.canonical_url, ctx.siteHost);
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
  const owns = ownsCanonical(article.canonical_url, ctx.siteHost);
  const linkedSeries = index.series.find((series) => series.id === existing?.seriesId);

  return {
    article,
    existing,
    slug,
    canonicalUrl: ctx.canonicalOrigin && owns ? `${ctx.canonicalOrigin}/blogs/${slug}` : null,
    canonicalForeign: !owns,
    seriesOutdated:
      article.collection_id !== null &&
      linkedSeries?.devtoCollectionId !== article.collection_id,
    duplicates: candidates.filter((blog) => blog !== existing),
  };
}

/**
 * Whether Dev.to's canonical differs from the one we want to manage.
 */
export function canonicalOutdated(
  current: string | null,
  desired: string | null,
): desired is string {
  return desired !== null && normalizeUrl(current) !== desired;
}

/**
 * Whether the local copy is missing or older than the article's last Dev.to edit.
 */
export function contentOutdated(plan: ImportPlan): boolean {
  const synced = Date.parse(plan.existing?.lastSyncedAt ?? "");
  if (Number.isNaN(synced)) return true;
  return synced < Date.parse(plan.article.edited_at ?? plan.article.published_at);
}

/**
 * Whether an article needs importing: missing/edited content, series link, or canonical.
 */
export function needsImport(plan: ImportPlan): boolean {
  return (
    contentOutdated(plan) ||
    plan.seriesOutdated ||
    canonicalOutdated(plan.article.canonical_url, plan.canonicalUrl)
  );
}

/**
 * Decodes the HTML entities Dev.to emits in `<title>`.
 */
function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) return String.fromCodePoint(Number(code.slice(1)));
    return named[code.toLowerCase()] ?? entity;
  });
}

/**
 * Reads a series name from its public page — the Forem API only exposes `collection_id`.
 */
async function fetchDevtoSeriesTitle(username: string, collectionId: number): Promise<string> {
  const fallback = `Dev.to series ${collectionId}`;
  const res = await fetch(`https://dev.to/${encodeURIComponent(username)}/series/${collectionId}`, {
    headers: { Accept: "text/html", "User-Agent": "tigawanna-web-importer" },
    cache: "no-store",
  });
  if (!res.ok) return fallback;

  const title = (await res.text()).match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) return fallback;
  const name = decodeHtmlEntities(title)
    .replace(/\s*-\s*DEV Community\s*$/i, "")
    .replace(/\s*Series'\s*Articles\s*$/i, "")
    .trim();
  return name || fallback;
}

/**
 * Maps Dev.to series ids → local series (mutating `index.series`), creating missing ones.
 * A local series with the same title but no Dev.to id is linked instead of duplicated.
 *
 * @returns Number of series created or newly linked.
 */
export async function ensureSeries(
  ctx: DevtoSyncContext,
  collectionIds: number[],
  index: BlogIndex,
): Promise<number> {
  const { payload } = ctx;
  const missing = [...new Set(collectionIds)].filter(
    (id) => !index.series.some((row) => row.devtoCollectionId === id),
  );

  const results = await Promise.all(
    missing.map(async (collectionId) => {
      try {
        const title = await fetchDevtoSeriesTitle(ctx.username, collectionId);
        const unlinked = index.series.find(
          (row) =>
            row.devtoCollectionId === null && row.title.toLowerCase() === title.toLowerCase(),
        );
        const doc = unlinked
          ? await payload.update({
              collection: "series",
              id: unlinked.id,
              data: { devtoCollectionId: collectionId },
              context: { disableRevalidate: true },
              overrideAccess: true,
            })
          : await payload.create({
              collection: "series",
              data: {
                title,
                slug: slugify(title)?.replace(/-{2,}/g, "-") || `devto-series-${collectionId}`,
                devtoCollectionId: collectionId,
              },
              context: { disableRevalidate: true },
              overrideAccess: true,
            });
        payload.logger.info(`  series ${unlinked ? "linked" : "created"}: ${title}`);
        return { id: doc.id, title: doc.title, devtoCollectionId: collectionId };
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        payload.logger.error(`  series ${collectionId} failed: ${error}`);
        return null;
      }
    }),
  );

  for (const row of results) {
    if (!row) continue;
    const at = index.series.findIndex((existing) => existing.id === row.id);
    if (at === -1) index.series.push(row);
    else index.series[at] = row;
  }
  return results.filter(Boolean).length;
}

/**
 * Points the Dev.to article's canonical at this site when it's outdated.
 * Never throws — canonical problems shouldn't block the content import.
 */
async function syncCanonical(
  ctx: DevtoSyncContext,
  plan: ImportPlan,
  detail: DevtoArticleDetail,
): Promise<Pick<ImportArticleOutcome, "canonical" | "canonicalError" | "canonicalUrl">> {
  if (!ctx.apiKey || !canonicalOutdated(detail.canonical_url, plan.canonicalUrl)) {
    return { canonical: "unchanged", canonicalUrl: detail.canonical_url };
  }
  try {
    const article = await setDevtoCanonicalUrl(ctx.apiKey, detail.id, plan.canonicalUrl);
    if (normalizeUrl(article.canonical_url) !== plan.canonicalUrl) {
      throw new Error("Dev.to kept its old value (front matter in the article body may override it)");
    }
    ctx.payload.logger.info(`  canonical → ${plan.canonicalUrl}`);
    return { canonical: "updated", canonicalUrl: plan.canonicalUrl };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    ctx.payload.logger.error(`  canonical failed ${plan.slug}: ${error}`);
    return { canonical: "failed", canonicalError: error, canonicalUrl: detail.canonical_url };
  }
}

/**
 * Imports one planned article: canonical fix on Dev.to, then create/update the blog.
 * Call `ensureSeries` for the article's `collection_id` first. Throws on content failure.
 */
export async function importPlannedArticle(
  ctx: DevtoSyncContext,
  plan: ImportPlan,
  options: { editorConfig: EditorConfig; index: BlogIndex; detail?: DevtoArticleDetail },
): Promise<ImportArticleOutcome> {
  const { payload } = ctx;
  const detail = options.detail ?? (await fetchArticleDetail(ctx, plan.article.id));
  // Before saving so `lastSyncedAt` lands after the `edited_at` bump from this PUT.
  const canonical = await syncCanonical(ctx, plan, detail);

  const tags = normalizeDevtoTags(detail.tag_list ?? plan.article.tag_list);
  const markdown = detail.body_markdown?.trim()
    ? stripDevtoFrontmatter(detail.body_markdown)
    : `${detail.description}\n\n[Read on Dev.to](${detail.url})`;
  const collectionId = detail.collection_id ?? plan.article.collection_id;
  const seriesId = options.index.series.find(
    (row) => collectionId !== null && row.devtoCollectionId === collectionId,
  )?.id;

  const data = {
    // No Dev.to series → leave any locally assigned series alone.
    ...(seriesId !== undefined ? { series: seriesId } : {}),
    title: detail.title,
    kind: "post" as const,
    description: detail.description || detail.title,
    content: markdownToLexicalWithCodeBlocks(markdown, options.editorConfig),
    slug: plan.slug,
    generateSlug: false,
    tags: tags.map((tag) => ({ tag })),
    publishedAt: detail.published_at,
    coverUrl: detail.cover_image || plan.article.cover_image || undefined,
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
  } else {
    await payload.create({
      collection: "blogs",
      data,
      context: { disableRevalidate: true },
      overrideAccess: true,
    });
  }

  const action = plan.existing ? "updated" : "created";
  payload.logger.info(`  ${action}: ${plan.slug}`);
  return { slug: plan.slug, action, ...canonical };
}

/**
 * Busts Next.js blog list caches after imports.
 */
export function bustBlogCaches() {
  try {
    revalidateTag("blogs", "max");
    revalidateTag("series", "max");
    revalidateTag("landing-posts", "max");
    revalidatePath("/blogs");
    revalidatePath("/");
  } catch {
    // Outside of a Next.js request (e.g. payload run) — ignore.
  }
}
