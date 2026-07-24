import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  STATIC_ARTICLES,
  STATIC_LESSONS,
  toLessonPreviewItem,
} from "@/components/landing/data/static";
import { formatDisplayDate } from "@/components/landing/utils/date-helpers";
import type { Blog } from "@/payload-types";
import type {
  ContentKind,
  JournalDetail,
  JournalPreviewItem,
  JournalsListPage,
} from "@/types/journals";

export const BLOGS_PER_PAGE = 8;
export const JOURNALS_PER_PAGE = 8;

/**
 * Maps a Payload blog doc into the shared preview shape.
 */
function toPreviewFromPayload(doc: Blog): JournalPreviewItem {
  const published = doc.publishedAt ?? doc.createdAt;
  const kind: ContentKind = doc.kind === "post" ? "post" : "journal";
  const hero = doc.heroImage && typeof doc.heroImage === "object" ? doc.heroImage.url : null;
  const cover =
    typeof doc.coverUrl === "string" && doc.coverUrl.trim().length > 0 ? doc.coverUrl.trim() : null;

  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    kind,
    created: published,
    createdLabel: formatDisplayDate(published),
    updated: doc.updatedAt,
    gist: doc.gist ?? undefined,
    tags: (doc.tags ?? []).map((row) => row.tag).filter(Boolean),
    heroImageUrl: hero ?? cover,
    previewHtml: null,
  };
}

/**
 * Maps a legacy static TIL fixture into a journal preview.
 */
function toPreviewFromStatic(id: string): JournalPreviewItem | null {
  const lesson = STATIC_LESSONS.find((item) => item.id === id);
  if (!lesson) return null;
  const preview = toLessonPreviewItem(lesson);
  return {
    id: preview.id,
    slug: preview.id,
    title: preview.title,
    description: preview.description,
    kind: "journal",
    created: preview.created,
    createdLabel: preview.createdLabel,
    updated: preview.updated,
    gist: preview.gist,
    tags: [],
    heroImageUrl: null,
    markdown: lesson.markdown,
    previewHtml: preview.previewHtml,
  };
}

/**
 * Clamps a 1-based page index into a valid range.
 */
function normalizePage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (totalPages < 1) return 1;
  return Math.min(Math.floor(page), totalPages);
}

/**
 * Static-fixture pagination used when Payload has no published journals yet.
 */
function paginateStaticJournals(page: number, perPage: number): JournalsListPage {
  const totalItems = STATIC_LESSONS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = normalizePage(page, totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: STATIC_LESSONS.slice(start, start + perPage).map((lesson) =>
      toPreviewFromStatic(lesson.id)!,
    ),
    page: safePage,
    perPage,
    totalPages,
    totalItems,
  };
}

/**
 * Landing journal cards — Cache Components entry used under Suspense.
 */
export async function getLandingTilPreviews(): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-journals");
  cacheTag("blogs");
  cacheTag("journals");

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 1,
      limit: 8,
      overrideAccess: false,
      pagination: false,
      sort: "-publishedAt",
      where: { kind: { equals: "journal" } },
    });

    if (result.docs.length > 0) {
      return result.docs.map(toPreviewFromPayload);
    }
  } catch (err: unknown) {
    console.error("[blogs] Payload landing journals query failed; using static fallback", err);
  }

  return STATIC_LESSONS.slice(0, 8).map((lesson) => toPreviewFromStatic(lesson.id)!);
}

/**
 * Landing blog-post cards — Cache Components entry used under Suspense.
 */
export async function getLandingPostPreviews(): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-posts");
  cacheTag("blogs");

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 1,
      limit: 8,
      overrideAccess: false,
      pagination: false,
      sort: "-publishedAt",
      where: { kind: { equals: "post" } },
    });
    return result.docs.map(toPreviewFromPayload);
  } catch (err: unknown) {
    console.error("[blogs] Payload landing posts query failed", err);
    return [];
  }
}

/**
 * Paginated journals (`kind: journal`) for `/journals?page=`.
 */
export async function getPublishedJournalsPage(options?: {
  page?: number;
  perPage?: number;
}): Promise<JournalsListPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  cacheTag("journals");

  const perPage = Math.max(1, options?.perPage ?? JOURNALS_PER_PAGE);
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1) || 1);
  cacheTag(`journals-page-${requestedPage}`);

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 1,
      limit: perPage,
      page: requestedPage,
      overrideAccess: false,
      pagination: true,
      sort: "-publishedAt",
      where: { kind: { equals: "journal" } },
    });

    if (result.totalDocs > 0) {
      const totalPages = Math.max(1, result.totalPages);
      return {
        items: result.docs.map(toPreviewFromPayload),
        page: normalizePage(result.page ?? requestedPage, totalPages),
        perPage,
        totalPages,
        totalItems: result.totalDocs,
      };
    }
  } catch (err: unknown) {
    console.error("[blogs] Payload journals page query failed; using static fallback", err);
  }

  return paginateStaticJournals(requestedPage, perPage);
}

/**
 * Paginated blog posts (`kind: post`) for `/blogs?page=`.
 */
export async function getPublishedBlogsPage(options?: {
  page?: number;
  perPage?: number;
}): Promise<JournalsListPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  const perPage = Math.max(1, options?.perPage ?? BLOGS_PER_PAGE);
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1) || 1);
  cacheTag(`blogs-page-${requestedPage}`);

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 1,
      limit: perPage,
      page: requestedPage,
      overrideAccess: false,
      pagination: true,
      sort: "-publishedAt",
      where: { kind: { equals: "post" } },
    });

    const totalPages = Math.max(1, result.totalPages || 1);
    return {
      items: result.docs.map(toPreviewFromPayload),
      page: normalizePage(result.page ?? requestedPage, totalPages),
      perPage,
      totalPages,
      totalItems: result.totalDocs,
    };
  } catch (err: unknown) {
    console.error("[blogs] Payload posts page query failed", err);
    return {
      items: [],
      page: 1,
      perPage,
      totalPages: 1,
      totalItems: 0,
    };
  }
}

/**
 * Resolves a published blog by slug, optionally requiring a kind.
 */
export async function getBlogBySlug(
  slug: string,
  options?: { kind?: ContentKind },
): Promise<JournalDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  cacheTag(`blog_${slug}`);
  if (options?.kind === "journal") cacheTag("journals");

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 2,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          { slug: { equals: slug } },
          ...(options?.kind ? [{ kind: { equals: options.kind } }] : []),
        ],
      },
    });

    const doc = result.docs[0];
    if (doc) {
      const preview = toPreviewFromPayload(doc);
      return {
        ...preview,
        content: doc.content ?? null,
        publishedAt: doc.publishedAt,
        source: "payload",
      };
    }
  } catch (err: unknown) {
    console.error(`[blogs] Payload slug lookup failed for "${slug}"`, err);
  }

  if (options?.kind === "post") return null;

  const staticPreview = toPreviewFromStatic(slug);
  if (!staticPreview) return null;

  return {
    ...staticPreview,
    content: null,
    publishedAt: staticPreview.created,
    source: "static",
  };
}

/**
 * Resolves a journal-kind entry (or static TIL fallback) by slug.
 */
export async function getJournalBySlug(slug: string): Promise<JournalDetail | null> {
  return getBlogBySlug(slug, { kind: "journal" });
}

/**
 * Related writing for a detail page — same kind, excluding the current slug.
 * Prefers tag overlap when the source doc has tags (Payload RelatedPosts pattern).
 */
export async function getRelatedBlogs(options: {
  slug: string;
  kind: ContentKind;
  tags?: string[];
  limit?: number;
}): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  if (options.kind === "journal") cacheTag("journals");
  cacheTag(`blog_${options.slug}`);

  const limit = Math.max(1, Math.min(options.limit ?? 3, 6));

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      depth: 1,
      limit: Math.max(limit * 4, 12),
      overrideAccess: false,
      pagination: false,
      sort: "-publishedAt",
      where: {
        and: [{ kind: { equals: options.kind } }, { slug: { not_equals: options.slug } }],
      },
    });

    const previews = result.docs.map(toPreviewFromPayload);
    const tagSet = new Set((options.tags ?? []).map((t) => t.toLowerCase()));

    if (tagSet.size === 0) {
      return previews.slice(0, limit);
    }

    const scored = previews
      .map((item) => ({
        item,
        score: item.tags.reduce((sum, tag) => sum + (tagSet.has(tag.toLowerCase()) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score || b.item.created.localeCompare(a.item.created));

    const withTags = scored.filter((row) => row.score > 0).map((row) => row.item);
    if (withTags.length >= limit) return withTags.slice(0, limit);

    const seen = new Set(withTags.map((item) => item.id));
    const fillers = previews.filter((item) => !seen.has(item.id));
    return [...withTags, ...fillers].slice(0, limit);
  } catch (err: unknown) {
    console.error(`[blogs] Related blogs query failed for "${options.slug}"`, err);
    return [];
  }
}

/**
 * Slugs for `generateStaticParams` on `/blogs/[slug]` (posts only).
 * Always returns at least one slug — Cache Components rejects empty params.
 */
export async function getBlogStaticParams(): Promise<Array<{ slug: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  const fromStatic = STATIC_ARTICLES.map((article) => ({ slug: article.slug })).filter(
    (entry): entry is { slug: string } => Boolean(entry.slug),
  );

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
      where: { kind: { equals: "post" } },
    });

    const fromCms = result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));

    if (fromCms.length > 0) return fromCms;
  } catch (err: unknown) {
    console.error("[blogs] Payload blog static params query failed", err);
  }

  return fromStatic.length > 0 ? fromStatic : [{ slug: "_placeholder" }];
}

/**
 * Slugs for `generateStaticParams` on `/journals/[slug]` — CMS journals + static TILs.
 */
export async function getJournalStaticParams(): Promise<Array<{ slug: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  cacheTag("journals");

  let fromCms: Array<{ slug: string }> = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "blogs",
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
      where: { kind: { equals: "journal" } },
    });

    fromCms = result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch (err: unknown) {
    console.error("[blogs] Payload journal static params query failed", err);
  }

  const fromStatic = STATIC_LESSONS.map((lesson) => ({ slug: lesson.id }));

  const seen = new Set<string>();
  return [...fromCms, ...fromStatic].filter(({ slug }) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}
