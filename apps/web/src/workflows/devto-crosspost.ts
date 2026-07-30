/**
 * Blog authoring + Dev.to open / sync workflow.
 *
 * 0. (Optional) Blogs list → **Import from Dev.to** — bulk re-import published articles by slug.
 * 1. (Optional) Blogs list → **Smart draft** → `/admin/smart-draft` (OpenRouter).
 * 2. Author / edit the post in Payload (usually as a draft).
 * 3. Admin ⋯ → **Publish to Dev.to** (or Meta → Dev.to) — Lexical→markdown, POST/PUT Forem API
 *    with `canonical_url` from `getBlogCanonicalUrl(slug)`, store `articleId`.
 * 4. Finish cover + inline images on Dev.to.
 * 5. Admin ⋯ → **Sync from Dev.to** — pull markdown/cover into Lexical + `coverUrl`.
 * 6. Publish on Payload when the site version is ready (or skip Dev.to and publish locally).
 *
 * Endpoints:
 * - Admin page: `/admin/smart-draft`
 * - `GET  /api/blogs/ai-draft/status`
 * - `GET  /api/blogs/ai-draft/models`
 * - `POST /api/blogs/ai-draft`
 * - `POST /api/blogs/ai-refine`
 * - `POST /api/blogs/to-markdown`
 * - `POST /api/blogs/from-markdown`
 * - `POST /api/blogs/import-from-devto`
 * - `POST /api/blogs/:id/open-devto`
 * - `POST /api/blogs/:id/sync-devto`
 *
 * Required env:
 * - `DEV_TO_KEY` (open/sync)
 * - Optional `DEVTO_USERNAME` for bulk import (default: tigawanna)
 * - Site origin via `getSiteUrl()`: `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → `http://localhost:3055`
 * - `OPENROUTER_API_KEY` (Smart draft; optional `OPENROUTER_MODEL`)
 *
 * @see https://developers.forem.com/api/v1#tag/articles
 */
export const DEVTO_WORKFLOW = {
  status: "implemented" as const,
  importPath: "/import-from-devto",
  openPath: "/:id/open-devto",
  syncPath: "/:id/sync-devto",
  smartDraftPath: "/smart-draft",
  apiDocs: "https://developers.forem.com/api/v1#tag/articles",
};
