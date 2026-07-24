import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

export type JournalKind = "post" | "til";

/**
 * Card / list projection shared by landing and /journals index.
 */
export interface JournalPreviewItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: JournalKind;
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
 * Full journal document for the detail page.
 */
export interface JournalDetail extends JournalPreviewItem {
  content: DefaultTypedEditorState | null;
  publishedAt?: string | null;
  source: "payload" | "static";
}
