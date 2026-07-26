import { siteConfig } from "@repo/site-constants";

/**
 * Public origin for canonical URLs (no trailing slash).
 *
 * Prefer `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://www.tigawanna.vip`).
 * Falls back to the site-constants website link for local/dev.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return siteConfig.links.website.replace(/\/$/, "");
}

/**
 * Absolute public URL for a blog post on this site.
 *
 * @param slug - Blog slug (without leading slash).
 */
export function getBlogCanonicalUrl(slug: string): string {
  const cleaned = slug.replace(/^\/+|\/+$/g, "");
  return `${getSiteUrl()}/blogs/${cleaned}`;
}
