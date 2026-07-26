import { randomBytes } from "crypto";
import { convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { CODE_BLOCK_LANGUAGES, type CodeBlockLanguage } from "@/blocks/Code/config";
import { parseMarkdownImage } from "@/utils/media-url";

const FENCE_RE = /```([\w+-]*)\r?\n([\s\S]*?)```/g;
/** Standalone markdown image on its own line (optional surrounding whitespace). */
const IMAGE_LINE_RE = /^[ \t]*!\[[^\]]*\]\([^)\s]+(?:\s+(?:"[^"]*"|'[^']*'))?\)[ \t]*$/gm;

const ALLOWED_LANGUAGES = new Set<string>(CODE_BLOCK_LANGUAGES.map((item) => item.value));

const LANGUAGE_ALIASES: Record<string, CodeBlockLanguage> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  zsh: "bash",
  shell: "shell",
  yml: "yaml",
  md: "markdown",
  text: "plaintext",
  txt: "plaintext",
  "": "typescript",
};

/**
 * Maps a markdown fence language to a Code block select value.
 */
function resolveCodeLanguage(raw: string): CodeBlockLanguage {
  const normalized = raw.trim().toLowerCase();
  const aliased = LANGUAGE_ALIASES[normalized] ?? (normalized as CodeBlockLanguage);
  if (ALLOWED_LANGUAGES.has(aliased)) return aliased;
  return "plaintext";
}

/**
 * Normalizes GitHub-style alerts into blockquotes our quote converter can style.
 *
 * Supports both bare `[!NOTE]` lines and `> [!NOTE]` GFM alert openers.
 */
export function normalizeMarkdownCallouts(markdown: string): string {
  return markdown
    .replace(
      /^([ \t]*>[ \t]*)\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*$/gim,
      (_, prefix: string, kind: string) => {
        const label = kind.charAt(0) + kind.slice(1).toLowerCase();
        return `${prefix}**${label}**`;
      },
    )
    .replace(/^[ \t]*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*$/gim, (_, kind: string) => {
      const label = kind.charAt(0) + kind.slice(1).toLowerCase();
      return `> **${label}**`;
    });
}

/**
 * Builds a Payload Lexical Code block node (Prism-highlighted on the frontend).
 */
function createCodeBlockNode(language: string, code: string) {
  return {
    type: "block" as const,
    format: "" as const,
    version: 2 as const,
    fields: {
      id: randomBytes(12).toString("hex"),
      blockName: "",
      blockType: "code" as const,
      language: resolveCodeLanguage(language),
      code,
    },
  };
}

/**
 * Builds a Payload Lexical Media block for a remote image URL.
 */
function createMediaBlockNode(alt: string, url: string) {
  return {
    type: "block" as const,
    format: "" as const,
    version: 2 as const,
    fields: {
      id: randomBytes(12).toString("hex"),
      blockName: "",
      blockType: "mediaBlock" as const,
      media: null,
      url,
      alt,
    },
  };
}

type LexicalChild = DefaultTypedEditorState["root"]["children"][number];

/**
 * Converts a markdown slice to Lexical children, lifting sole-line images into Media blocks.
 */
function proseToLexicalChildren(
  prose: string,
  editorConfig: Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"],
): LexicalChild[] {
  const trimmed = prose.trim();
  if (!trimmed) return [];

  const children: LexicalChild[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  IMAGE_LINE_RE.lastIndex = 0;
  while ((match = IMAGE_LINE_RE.exec(trimmed)) !== null) {
    const before = trimmed.slice(lastIndex, match.index).trim();
    if (before) {
      const lexical = convertMarkdownToLexical({ editorConfig, markdown: before });
      children.push(...lexical.root.children);
    }

    const parsed = parseMarkdownImage(match[0]);
    if (parsed) {
      children.push(createMediaBlockNode(parsed.alt, parsed.url) as unknown as LexicalChild);
    } else {
      const lexical = convertMarkdownToLexical({ editorConfig, markdown: match[0] });
      children.push(...lexical.root.children);
    }

    lastIndex = match.index + match[0].length;
  }

  const trailing = trimmed.slice(lastIndex).trim();
  if (trailing) {
    const lexical = convertMarkdownToLexical({ editorConfig, markdown: trailing });
    children.push(...lexical.root.children);
  }

  if (children.length === 0) {
    const lexical = convertMarkdownToLexical({ editorConfig, markdown: trimmed });
    return lexical.root.children;
  }

  return children;
}

/**
 * Converts leftover `![alt](url)` paragraphs (from older imports) into Media blocks.
 *
 * @param content - Lexical editor state from Payload.
 * @returns A shallow-copied tree with markdown-image paragraphs replaced.
 */
export function hydrateMarkdownImageBlocks(
  content: DefaultTypedEditorState,
): DefaultTypedEditorState {
  const children = content.root.children.flatMap((node) => {
    if (!node || typeof node !== "object" || !("type" in node) || node.type !== "paragraph") {
      return [node];
    }

    const paragraph = node as {
      type: "paragraph";
      children?: Array<{ type?: string; text?: string }>;
    };
    const kids = paragraph.children ?? [];
    if (kids.length !== 1 || kids[0]?.type !== "text" || typeof kids[0].text !== "string") {
      return [node];
    }

    const parsed = parseMarkdownImage(kids[0].text);
    if (!parsed) return [node];

    return [createMediaBlockNode(parsed.alt, parsed.url) as unknown as LexicalChild];
  });

  return {
    ...content,
    root: {
      ...content.root,
      children,
    },
  };
}

/**
 * Converts markdown to Lexical, lifting fenced code into Code blocks and
 * standalone images into Media blocks.
 *
 * Default `convertMarkdownToLexical` leaves ``` fences as plain paragraph text
 * when CodeFeature isn't in the editor config — so we split fences ourselves.
 * Images are lifted the same way so remote URLs become Media blocks.
 */
export function markdownToLexicalWithCodeBlocks(
  markdown: string,
  editorConfig: Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"],
): DefaultTypedEditorState {
  const normalized = normalizeMarkdownCallouts(markdown);
  const children: LexicalChild[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FENCE_RE.lastIndex = 0;
  while ((match = FENCE_RE.exec(normalized)) !== null) {
    const prose = normalized.slice(lastIndex, match.index);
    children.push(...proseToLexicalChildren(prose, editorConfig));

    children.push(
      createCodeBlockNode(match[1] ?? "", match[2].replace(/\n$/, "")) as unknown as LexicalChild,
    );
    lastIndex = match.index + match[0].length;
  }

  children.push(...proseToLexicalChildren(normalized.slice(lastIndex), editorConfig));

  if (children.length === 0) {
    return convertMarkdownToLexical({ editorConfig, markdown: normalized || " " });
  }

  return {
    root: {
      type: "root",
      children,
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  };
}
