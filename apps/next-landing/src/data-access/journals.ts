import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  STATIC_LESSONS,
  toLessonPreviewItem,
} from "@/components/landing/data/static";
import { formatDisplayDate } from "@/components/landing/utils/date-helpers";
import type { Journal } from "@/payload-types";
import type { JournalDetail, JournalKind, JournalPreviewItem } from "@/types/journals";

/**
 * Maps a Payload journal doc into the shared preview shape.
 */
function toPreviewFromPayload(doc: Journal): JournalPreviewItem {
  const published = doc.publishedAt ?? doc.createdAt;
  const hero =
    doc.heroImage && typeof doc.heroImage === "object" ? doc.heroImage.url : null;

  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    kind: doc.kind,
    created: published,
    createdLabel: formatDisplayDate(published),
    updated: doc.updatedAt,
    gist: doc.gist ?? undefined,
    tags: (doc.tags ?? []).map((row) => row.tag).filter(Boolean),
    heroImageUrl: hero,
    previewHtml: null,
  };
}

/**
 * Maps a legacy static TIL fixture into the journal preview shape.
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
    kind: "til",
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
 * Uncached Payload query for published journals.
 */
async function fetchPublishedJournals(options?: {
  kind?: JournalKind;
  limit?: number;
}): Promise<JournalPreviewItem[]> {
  const limit = options?.limit ?? 100;

  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: "journals",
      draft: false,
      limit,
      overrideAccess: false,
      pagination: false,
      sort: "-publishedAt",
      ...(options?.kind
        ? {
            where: {
              kind: { equals: options.kind },
            },
          }
        : {}),
    });

    if (result.docs.length > 0) {
      return result.docs.map(toPreviewFromPayload);
    }
  } catch (err: unknown) {
    console.error("[journals] Payload query failed; using static fallback", err);
  }

  // Offline-friendly bootstrap: serve static TILs until the first CMS publish.
  if (!options?.kind || options.kind === "til") {
    return STATIC_LESSONS.slice(0, limit).map((lesson) => toPreviewFromStatic(lesson.id)!);
  }

  return [];
}

/**
 * Lists published journals from Payload, optionally filtered by kind.
 * Falls back to static TIL fixtures when the CMS has no published docs yet.
 */
export async function getPublishedJournals(options?: {
  kind?: JournalKind;
  limit?: number;
}): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journals");
  if (options?.kind === "til") cacheTag("landing-journals");
  if (options?.kind === "post") cacheTag("landing-posts");
  return fetchPublishedJournals(options);
}

/**
 * Landing TIL cards — Cache Components entry used under Suspense.
 */
export async function getLandingTilPreviews(): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-journals");
  return fetchPublishedJournals({ kind: "til", limit: 8 });
}

/**
 * Landing article cards from Payload blog posts (empty when none published).
 */
export async function getLandingPostPreviews(): Promise<JournalPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-posts");
  return fetchPublishedJournals({ kind: "post", limit: 8 });
}

/**
 * Resolves a journal by slug for the detail page (Payload, then static TILs).
 */
export async function getJournalBySlug(slug: string): Promise<JournalDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("journals");
  cacheTag(`journal_${slug}`);

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "journals",
      draft: false,
      depth: 2,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      where: {
        slug: { equals: slug },
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
    console.error(`[journals] Payload slug lookup failed for "${slug}"`, err);
  }

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
 * Slugs for `generateStaticParams` — Payload published + static TIL ids.
 */
export async function getJournalStaticParams(): Promise<Array<{ slug: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("journals");

  let fromCms: Array<{ slug: string }> = [];

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "journals",
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
    });

    fromCms = result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch (err: unknown) {
    console.error("[journals] Payload static params query failed", err);
  }

  const fromStatic = STATIC_LESSONS.map((lesson) => ({ slug: lesson.id }));

  const seen = new Set<string>();
  return [...fromCms, ...fromStatic].filter(({ slug }) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}
