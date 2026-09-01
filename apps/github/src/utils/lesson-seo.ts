import { buildJournalOgImageUrl } from "@/lib/takumi/build-og-image-url";
import type { LessonItem } from "@/types/lessons";
import { AppConfig } from "@/utils/system";

const LESSONS_INDEX_DESCRIPTION =
  "Every bug is a lesson in disguise. Here are the pearls of wisdom gathered along the way.";

/**
 * Truncates text for meta descriptions and OG cards without cutting mid-word when possible.
 */
export function truncateSeoText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${base.trimEnd()}…`;
}

/**
 * Formats a journal entry type for display in meta tags and OG cards.
 */
export function formatLessonTypeLabel(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (normalized === "til") return "TIL";
  if (normalized === "challenge") return "Challenge";
  if (normalized === "note") return "Note";
  return type.trim() || "Journal";
}

/**
 * Builds the canonical public URL for a lesson/journal entry.
 */
export function buildLessonCanonicalUrl(lessonId: string): string {
  return `${AppConfig.links.website}/lessons/${lessonId}`;
}

/**
 * Builds Open Graph, Twitter, and SEO meta for the lessons index page.
 */
export function buildLessonsIndexSeoHead() {
  const title = "Lessons | Today I Learned";
  const description = LESSONS_INDEX_DESCRIPTION;
  const canonicalUrl = `${AppConfig.links.website}/lessons`;
  const ogImage = buildJournalOgImageUrl({
    title: "You code, you learn",
    description,
    type: "Journal",
  });

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: AppConfig.name },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: AppConfig.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${title} — ${AppConfig.name}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@tigawanna" },
      { name: "twitter:creator", content: "@tigawanna" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}

/**
 * Builds Open Graph, Twitter, Article, and SEO meta for a single lesson/journal page.
 */
export function buildLessonDetailSeoHead(lesson: LessonItem) {
  const typeLabel = formatLessonTypeLabel(lesson.type);
  const title = `${lesson.title} | ${typeLabel}`;
  const description = truncateSeoText(
    lesson.description ||
      lesson.markdown.replace(/[#>*`[\]]/g, " ").trim() ||
      LESSONS_INDEX_DESCRIPTION,
    160,
  );
  const canonicalUrl = buildLessonCanonicalUrl(lesson.id);
  const ogImage = buildJournalOgImageUrl({
    title: truncateSeoText(lesson.title, 110),
    description: truncateSeoText(description, 140),
    type: typeLabel,
  });
  const publishedTime = new Date(lesson.created).toISOString();
  const modifiedTime = new Date(lesson.updated).toISOString();

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: AppConfig.name },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: AppConfig.name },
      { property: "og:title", content: lesson.title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${lesson.title} — ${AppConfig.name}` },
      { property: "article:published_time", content: publishedTime },
      { property: "article:modified_time", content: modifiedTime },
      { property: "article:author", content: AppConfig.name },
      { property: "article:section", content: typeLabel },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@tigawanna" },
      { name: "twitter:creator", content: "@tigawanna" },
      { name: "twitter:title", content: lesson.title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: lesson.title,
          description,
          image: [ogImage],
          datePublished: publishedTime,
          dateModified: modifiedTime,
          author: {
            "@type": "Person",
            name: AppConfig.name,
            url: AppConfig.links.website,
          },
          publisher: {
            "@type": "Person",
            name: AppConfig.name,
            url: AppConfig.links.website,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
          keywords: [typeLabel, "Today I Learned", "journal", "tigawanna"],
        }),
      },
    ],
  };
}
