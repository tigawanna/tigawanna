/**
 * Builds a URL-safe slug from heading text (GFM / Dev.to style anchors).
 *
 * @param text - Visible heading text.
 * @returns Lowercase hyphenated slug, or empty string when nothing usable remains.
 */
export function slugifyHeading(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

/**
 * Returns a unique slug, appending `-2`, `-3`, … when collisions occur.
 *
 * @param base - Preferred slug from {@link slugifyHeading}.
 * @param used - Set of already-assigned slugs (mutated).
 */
export function uniqueSlug(base: string, used: Set<string>): string {
  const fallback = base || "section";
  if (!used.has(fallback)) {
    used.add(fallback);
    return fallback;
  }
  let n = 2;
  while (used.has(`${fallback}-${n}`)) n += 1;
  const next = `${fallback}-${n}`;
  used.add(next);
  return next;
}
