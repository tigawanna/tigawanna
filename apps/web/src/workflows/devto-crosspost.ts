/**
 * Dev.to cross-post workflow scaffold.
 *
 * Intended later shape:
 * 1. Blog published with `devto.enabled`
 * 2. Job reads markdown/Lexical → Dev.to markdown
 * 3. POST https://dev.to/api/articles with `canonical_url` = site `/blogs/{slug}`
 * 4. Store returned `url` on `devto.url` and set `devto.status: 'published'`
 *
 * Required env (when implemented):
 * - DEVTO_API_KEY
 * - NEXT_PUBLIC_SITE_URL (for canonical URLs)
 *
 * For now {@link scaffoldDevtoCrossPost} only logs intent on publish.
 */
export const DEVTO_CROSSPOST_SCAFFOLD = {
  status: "not_implemented" as const,
  apiDocs: "https://developers.forem.com/api/v1#tag/articles/operation/createArticle",
};
