import type { Payload } from "payload";

import { getSiteUrl } from "@/lib/site-url";
import {
  canonicalOutdated,
  contentOutdated,
  createDevtoSyncContext,
  listPublishedArticles,
  loadBlogIndex,
  planArticle,
  type BlogIndex,
  type DevtoSyncContext,
  type ExistingBlog,
  type ImportPlan,
} from "@/modules/devto/devto-sync";
import type { Blog } from "@/payload-types";

/** Local copy vs Dev.to: missing, older than the last edit, series unlinked, or current. */
export type DevtoSyncState = "missing" | "outdated" | "series" | "synced";

/** Dev.to canonical: ours, needs fixing, points elsewhere, or not managed (no key / site URL). */
export type DevtoCanonicalState = "ok" | "outdated" | "foreign" | "unmanaged";

export type DevtoLocalBlogRef = {
  id: Blog["id"];
  slug: string;
  title: string;
  status: "draft" | "published";
};

export type DevtoOverviewRow = {
  articleId: number;
  title: string;
  devtoSlug: string;
  devtoUrl: string;
  publishedAt: string;
  editedAt: string | null;
  canonicalUrl: string | null;
  desiredCanonicalUrl: string | null;
  collectionId: number | null;
  /** Local series title once the Dev.to series is linked. */
  seriesTitle: string | null;
  local: (DevtoLocalBlogRef & { lastSyncedAt: string | null }) | null;
  sync: DevtoSyncState;
  canonical: DevtoCanonicalState;
  duplicates: DevtoLocalBlogRef[];
};

export type DevtoOverview = {
  username: string;
  config: {
    hasApiKey: boolean;
    /** Origin used for Dev.to canonicals, or `null` when canonical management is off. */
    canonicalOrigin: string | null;
    siteUrl: string;
  };
  rows: DevtoOverviewRow[];
  fetchedAt: string;
};

/**
 * Minimal local blog reference for the admin UI.
 */
function toRef(blog: ExistingBlog): DevtoLocalBlogRef {
  return { id: blog.id, slug: blog.slug, title: blog.title, status: blog.status };
}

/**
 * Derives the admin row (sync + canonical state) for a planned article.
 */
export function toOverviewRow(
  ctx: DevtoSyncContext,
  plan: ImportPlan,
  index: BlogIndex,
): DevtoOverviewRow {
  const { article, existing } = plan;

  let sync: DevtoSyncState = "synced";
  if (!existing) sync = "missing";
  else if (contentOutdated(plan)) sync = "outdated";
  else if (plan.seriesOutdated) sync = "series";

  let canonical: DevtoCanonicalState = "ok";
  if (plan.canonicalForeign) canonical = "foreign";
  else if (!ctx.canonicalOrigin) canonical = "unmanaged";
  else if (canonicalOutdated(article.canonical_url, plan.canonicalUrl)) canonical = "outdated";

  return {
    articleId: article.id,
    title: article.title,
    devtoSlug: article.slug,
    devtoUrl: article.url,
    publishedAt: article.published_at,
    editedAt: article.edited_at,
    canonicalUrl: article.canonical_url,
    desiredCanonicalUrl: plan.canonicalUrl,
    collectionId: article.collection_id,
    seriesTitle:
      index.series.find(
        (row) => article.collection_id !== null && row.devtoCollectionId === article.collection_id,
      )?.title ?? null,
    local: existing ? { ...toRef(existing), lastSyncedAt: existing.lastSyncedAt } : null,
    sync,
    canonical,
    duplicates: plan.duplicates.map(toRef),
  };
}

/**
 * Published Dev.to articles matched to local blogs for the admin page.
 * One Dev.to request + one DB pass.
 */
export async function getDevtoOverview(payload: Payload): Promise<DevtoOverview> {
  const ctx = createDevtoSyncContext(payload);
  const [articles, index] = await Promise.all([listPublishedArticles(ctx), loadBlogIndex(payload)]);

  return {
    username: ctx.username,
    config: {
      hasApiKey: Boolean(ctx.apiKey),
      canonicalOrigin: ctx.canonicalOrigin ?? null,
      siteUrl: getSiteUrl(),
    },
    rows: articles.map((article) => toOverviewRow(ctx, planArticle(ctx, article, index), index)),
    fetchedAt: new Date().toISOString(),
  };
}
