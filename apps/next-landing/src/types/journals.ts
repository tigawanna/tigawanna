import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

/** Discriminator for public routes and cards. */
export type ContentKind = "journal" | "post";

/**
 * Card / list projection shared by landing, /journals, and /blogs.
 */
export interface JournalPreviewItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: ContentKind;
  created: string;
  createdLabel: string;
  updated: string;
  gist?: string;
  tags: string[];
  heroImageUrl?: string | null;
  /** Static-fixture markdown body when Lexical content is unavailable. */
  markdown?: string;
  previewHtml: string | null;
}

/**
 * Full blog document (journal or post) for detail pages.
 */
export interface JournalDetail extends JournalPreviewItem {
  content: DefaultTypedEditorState | null;
  publishedAt?: string | null;
  source: "payload" | "static";
}

/**
 * Paginated list result for `/journals?page=` or `/blogs?page=`.
 */
export interface JournalsListPage {
  items: JournalPreviewItem[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}
