/**
 * Strip a trailing slash from an origin string.
 *
 * @param url - Absolute origin or URL.
 */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Build `https://…` from Vercel's host-only `VERCEL_URL` (no protocol).
 *
 * @returns Normalized origin, or `undefined` when unset.
 */
function originFromVercelUrl(): string | undefined {
  const host = process.env.VERCEL_URL?.trim();
  if (!host) return undefined;
  const withProtocol =
    host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
  return stripTrailingSlash(withProtocol);
}

/**
 * Public origin from env only (no localhost fallback).
 *
 * Order: explicit `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL` (auto on Vercel).
 * Explicit wins so a custom domain is not overridden by the always-present deployment host.
 *
 * @returns Normalized origin without trailing slash, or `undefined`.
 */
export function getSiteUrlFromEnv(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  return originFromVercelUrl();
}

/**
 * Public origin for canonical URLs, Payload `serverURL`, and metadata (no trailing slash).
 *
 * Prefer `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.tigawanna.vip`), then
 * `VERCEL_URL` when deployed, then local Next/Payload (`http://localhost:3055`).
 */
export function getSiteUrl(): string {
  return getSiteUrlFromEnv() ?? "http://localhost:3055";
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
