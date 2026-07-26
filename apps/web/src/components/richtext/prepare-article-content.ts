import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { slugifyHeading, uniqueSlug } from "@/utils/heading-slug";

export type TocItem = {
  id: string;
  title: string;
  depth: 2 | 3 | 4;
};

type LexicalNode = {
  type?: string;
  tag?: string;
  children?: LexicalNode[];
  text?: string;
  fields?: { url?: string | null; linkType?: string };
};

/**
 * Collects plain text from a Lexical node tree.
 *
 * @param node - Lexical serialized node.
 */
export function getLexicalPlainText(node: LexicalNode | null | undefined): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.children)) return "";
  return node.children.map((child) => getLexicalPlainText(child)).join("");
}

/**
 * True when a heading is an imported “Table of Contents” marker.
 *
 * @param node - Lexical node.
 */
function isTocHeading(node: LexicalNode): boolean {
  if (node.type !== "heading") return false;
  const text = getLexicalPlainText(node).trim().toLowerCase();
  return text === "table of contents" || text === "contents";
}

/**
 * Assigns stable `id` fields onto heading nodes (mutates a shallow copy tree).
 * Strips an imported TOC heading + following list, and returns TOC entries from h2–h4.
 *
 * @param data - Lexical editor state from Payload.
 */
export function prepareArticleRichText(data: DefaultTypedEditorState): {
  data: DefaultTypedEditorState;
  toc: TocItem[];
  /** Index in the *stripped* children where the TOC UI should render, or -1. */
  tocInsertIndex: number;
} {
  const used = new Set<string>();
  const toc: TocItem[] = [];
  const source = data.root.children as LexicalNode[];

  let tocInsertIndex = -1;
  const withoutImportedToc: LexicalNode[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const node = source[i]!;
    if (isTocHeading(node)) {
      tocInsertIndex = withoutImportedToc.length;
      const next = source[i + 1];
      if (next?.type === "list") i += 1;
      continue;
    }
    withoutImportedToc.push(node);
  }

  if (tocInsertIndex < 0) {
    // No imported TOC — place after the first intro paragraph block, if any.
    const firstHeading = withoutImportedToc.findIndex((n) => n.type === "heading");
    tocInsertIndex = firstHeading > 0 ? firstHeading : 0;
  }

  const children = withoutImportedToc.map((node) => {
    if (node.type !== "heading" || !node.tag) return node;

    const title = getLexicalPlainText(node).trim();
    if (!title) return node;

    const depth = Number(String(node.tag).replace("h", "")) as 2 | 3 | 4;
    if (depth < 2 || depth > 4) return node;

    const id = uniqueSlug(slugifyHeading(title), used);
    // Contents nav stays scannable — only top-level sections (h2).
    if (depth === 2) {
      toc.push({ id, title, depth });
    }

    return { ...node, id };
  });

  return {
    data: {
      ...data,
      root: {
        ...data.root,
        children: children as DefaultTypedEditorState["root"]["children"],
      },
    },
    toc,
    tocInsertIndex,
  };
}

export type CalloutVariant = "note" | "tip" | "warning" | "important" | "caution";

const CALLOUT_LABELS: Record<CalloutVariant, RegExp> = {
  note: /^note\b/i,
  tip: /^tip\b/i,
  warning: /^warning\b/i,
  important: /^important\b/i,
  caution: /^caution\b/i,
};

/**
 * Detects a GFM-style callout label at the start of a quote node’s text.
 *
 * @param node - Lexical quote node.
 * @returns Variant + whether the label text should be hidden (we render our own).
 */
export function detectQuoteCallout(node: LexicalNode): CalloutVariant | null {
  const text = getLexicalPlainText(node).trim();
  for (const [variant, re] of Object.entries(CALLOUT_LABELS) as Array<[CalloutVariant, RegExp]>) {
    if (re.test(text)) return variant;
  }
  return null;
}
