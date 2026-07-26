/**
 * Absolute or site-relative URL suitable for next/image.
 *
 * Payload upload urls are often relative (`/api/media/file/...`).
 * Remote covers (e.g. Dev.to) are already absolute.
 *
 * @param url - Raw media URL from Payload or a remote cover string.
 * @returns Trimmed URL, or null when empty / invalid.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const MARKDOWN_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+(?:"([^"]*)"|'([^']*)'))?\)$/;

/**
 * Parses a sole-paragraph markdown image (`![alt](url)`).
 *
 * @param text - Paragraph text that may be a markdown image.
 * @returns Alt + URL when the text is exactly one markdown image, otherwise null.
 */
export function parseMarkdownImage(text: string): { alt: string; url: string } | null {
  const match = text.trim().match(MARKDOWN_IMAGE_RE);
  if (!match) return null;
  const url = resolveMediaUrl(match[2]);
  if (!url) return null;
  return { alt: match[1] ?? "", url };
}
