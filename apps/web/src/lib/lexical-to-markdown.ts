import { convertLexicalToMarkdown } from "@payloadcms/richtext-lexical";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { resolveMediaUrl } from "@/utils/media-url";

type LexicalChild = DefaultTypedEditorState["root"]["children"][number];

type BlockFields = {
  blockType?: string;
  language?: string;
  code?: string;
  url?: string | null;
  alt?: string | null;
  media?:
    | number
    | {
        url?: string | null;
        alt?: string | null;
      }
    | null;
  style?: string;
  content?: DefaultTypedEditorState | null;
};

type BlockNode = {
  type: "block";
  fields?: BlockFields;
};

const BANNER_STYLE_TO_CALLOUT: Record<string, string> = {
  info: "Note",
  success: "Tip",
  warning: "Warning",
  error: "Caution",
};

/**
 * Escapes a fenced code body for Dev.to markdown.
 */
function fenceCode(language: string, code: string): string {
  const lang = language === "plaintext" ? "" : language;
  return `\`\`\`${lang}\n${code.replace(/\n$/, "")}\n\`\`\``;
}

/**
 * Builds a markdown image line from a Media block.
 */
function mediaBlockToMarkdown(fields: BlockFields): string {
  const uploaded = fields.media && typeof fields.media === "object" ? fields.media : null;
  const url = resolveMediaUrl(uploaded?.url) ?? resolveMediaUrl(fields.url ?? undefined);
  if (!url) return "";

  const alt = (uploaded?.alt ?? fields.alt ?? "").trim();
  return `![${alt}](${url})`;
}

/**
 * Converts a Banner block into a callout blockquote Dev.to / GFM understand.
 */
function bannerBlockToMarkdown(
  fields: BlockFields,
  editorConfig: Parameters<typeof convertLexicalToMarkdown>[0]["editorConfig"],
): string {
  const label = BANNER_STYLE_TO_CALLOUT[fields.style ?? "info"] ?? "Note";
  const inner = fields.content
    ? convertLexicalToMarkdown({ data: fields.content, editorConfig }).trim()
    : "";
  const lines = inner ? inner.split("\n").map((line) => (line ? `> ${line}` : ">")) : [">"];
  return [`> **${label}**`, ...lines].join("\n");
}

/**
 * Turns a Lexical block node into markdown text (empty when unsupported / empty).
 */
function blockToMarkdown(
  node: BlockNode,
  editorConfig: Parameters<typeof convertLexicalToMarkdown>[0]["editorConfig"],
): string {
  const fields = node.fields ?? {};
  switch (fields.blockType) {
    case "code":
      return fenceCode(fields.language ?? "typescript", fields.code ?? "");
    case "mediaBlock":
      return mediaBlockToMarkdown(fields);
    case "banner":
      return bannerBlockToMarkdown(fields, editorConfig);
    default:
      return "";
  }
}

/**
 * Converts a contiguous slice of non-block Lexical children to markdown.
 */
function proseChildrenToMarkdown(
  children: LexicalChild[],
  editorConfig: Parameters<typeof convertLexicalToMarkdown>[0]["editorConfig"],
): string {
  if (children.length === 0) return "";
  return convertLexicalToMarkdown({
    data: {
      root: {
        type: "root",
        children,
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    },
    editorConfig,
  }).trim();
}

/**
 * Converts Payload Lexical editor state to Dev.to-friendly markdown.
 *
 * Custom blocks (Code, Media, Banner) become fenced code, images, and callout
 * blockquotes. Everything else uses Payload's stock Lexical→markdown converter.
 *
 * @param content - Lexical editor state from a blog `content` field.
 * @param editorConfig - Sanitized server editor config from `editorConfigFactory`.
 */
export function lexicalToMarkdownWithBlocks(
  content: DefaultTypedEditorState,
  editorConfig: Parameters<typeof convertLexicalToMarkdown>[0]["editorConfig"],
): string {
  const parts: string[] = [];
  let proseBuffer: LexicalChild[] = [];

  const flushProse = () => {
    const markdown = proseChildrenToMarkdown(proseBuffer, editorConfig);
    proseBuffer = [];
    if (markdown) parts.push(markdown);
  };

  for (const node of content.root.children) {
    if (
      node &&
      typeof node === "object" &&
      "type" in node &&
      (node as { type: string }).type === "block"
    ) {
      flushProse();
      const markdown = blockToMarkdown(node as unknown as BlockNode, editorConfig);
      if (markdown) parts.push(markdown);
      continue;
    }
    proseBuffer.push(node);
  }

  flushProse();
  return parts.join("\n\n").trim();
}
