import { randomBytes } from "crypto";
import { convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { CODE_BLOCK_LANGUAGES, type CodeBlockLanguage } from "@/blocks/Code/config";
import { parseMarkdownImage } from "@/utils/media-url";

const FENCE_RE = /```([\w+-]*)\r?\n([\s\S]*?)```/g;
/** Standalone markdown image on its own line (optional surrounding whitespace). */
const IMAGE_LINE_RE = /^[ \t]*!\[[^\]]*\]\([^)\s]+(?:\s+(?:"[^"]*"|'[^']*'))?\)[ \t]*$/gm;
/** GFM table row (`| a | b |`). */
const TABLE_ROW_RE = /^\|(.+)\|\s*$/;
/** GFM header divider (`| --- | :---: |`). */
const TABLE_DIVIDER_RE = /^(\| ?:?-*:? ?)+\|\s*$/;

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

/** Lexical table header flag for the first row (matches `@lexical/table` ROW). */
const TABLE_HEADER_ROW = 1;

type EditorConfig = Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"];
type LexicalChild = DefaultTypedEditorState["root"]["children"][number];

type ProseOrTableSegment = { kind: "prose"; text: string } | { kind: "table"; rows: string[][] };

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

/**
 * Returns whether a line looks like a GFM table row.
 */
function isGfmTableRow(line: string): boolean {
  return TABLE_ROW_RE.test(line.trim());
}

/**
 * Returns whether a line is a GFM table header divider.
 */
function isGfmTableDivider(line: string): boolean {
  return TABLE_DIVIDER_RE.test(line.trim());
}

/**
 * Splits a GFM table row into cell markdown strings.
 *
 * @param line - A `| cell | cell |` line.
 */
function parseGfmTableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

/**
 * Splits markdown into prose and GFM table segments.
 *
 * A table requires a contiguous run of pipe rows that includes a `| --- |` divider.
 *
 * @param markdown - Markdown that may contain GFM tables.
 */
export function splitGfmTables(markdown: string): ProseOrTableSegment[] {
  const lines = markdown.split(/\r?\n/);
  const segments: ProseOrTableSegment[] = [];
  let proseLines: string[] = [];

  const flushProse = () => {
    if (proseLines.length === 0) return;
    const text = proseLines.join("\n");
    proseLines = [];
    if (text.trim()) segments.push({ kind: "prose", text });
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (isGfmTableRow(line)) {
      const tableLines: string[] = [];
      let cursor = index;
      while (cursor < lines.length && isGfmTableRow(lines[cursor] ?? "")) {
        tableLines.push(lines[cursor] ?? "");
        cursor += 1;
      }

      const hasDivider = tableLines.some(isGfmTableDivider);
      if (hasDivider && tableLines.length >= 2) {
        flushProse();
        const rows = tableLines.filter((row) => !isGfmTableDivider(row)).map(parseGfmTableCells);
        if (rows.length > 0) segments.push({ kind: "table", rows });
        index = cursor;
        continue;
      }
    }

    proseLines.push(line);
    index += 1;
  }

  flushProse();
  return segments;
}

/**
 * Converts a single table cell's markdown into Lexical paragraph children.
 */
function cellToLexicalChildren(cellMarkdown: string, editorConfig: EditorConfig): LexicalChild[] {
  const markdown = cellMarkdown.trim() || " ";
  const lexical = convertMarkdownToLexical({ editorConfig, markdown });
  if (lexical.root.children.length > 0) return lexical.root.children;

  return [
    {
      type: "paragraph",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [
        {
          type: "text",
          version: 1,
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: cellMarkdown.trim(),
        },
      ],
    } as unknown as LexicalChild,
  ];
}

/**
 * Builds a Lexical `table` node matching Payload's TableJSXConverter shape.
 *
 * @param rows - Cell markdown strings; the first row is treated as a header.
 * @param editorConfig - Editor config used to convert inline cell markdown.
 */
function createTableNode(rows: string[][], editorConfig: EditorConfig): LexicalChild {
  const columnCount = Math.max(...rows.map((row) => row.length), 1);

  const tableRows = rows.map((row, rowIndex) => {
    const cells = Array.from({ length: columnCount }, (_, colIndex) => {
      const cellMarkdown = row[colIndex] ?? "";
      return {
        type: "tablecell" as const,
        version: 1 as const,
        headerState: rowIndex === 0 ? TABLE_HEADER_ROW : 0,
        colSpan: 1,
        rowSpan: 1,
        backgroundColor: null,
        direction: null,
        format: "" as const,
        indent: 0,
        children: cellToLexicalChildren(cellMarkdown, editorConfig),
      };
    });

    return {
      type: "tablerow" as const,
      version: 1 as const,
      direction: null,
      format: "" as const,
      indent: 0,
      children: cells,
    };
  });

  return {
    type: "table",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: tableRows,
  } as unknown as LexicalChild;
}

/**
 * Converts a prose slice that may still contain images (no tables) to Lexical children.
 */
function imageAwareProseToLexical(prose: string, editorConfig: EditorConfig): LexicalChild[] {
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
 * Converts a markdown slice to Lexical children, lifting GFM tables and sole-line images.
 */
function proseToLexicalChildren(prose: string, editorConfig: EditorConfig): LexicalChild[] {
  const trimmed = prose.trim();
  if (!trimmed) return [];

  const children: LexicalChild[] = [];
  for (const segment of splitGfmTables(trimmed)) {
    if (segment.kind === "table") {
      children.push(createTableNode(segment.rows, editorConfig));
      continue;
    }
    children.push(...imageAwareProseToLexical(segment.text, editorConfig));
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
 * Converts markdown to Lexical, lifting fenced code into Code blocks,
 * GFM tables into Lexical table nodes, and standalone images into Media blocks.
 *
 * Default `convertMarkdownToLexical` leaves ``` fences as plain paragraph text
 * when CodeFeature isn't in the editor config — so we split fences ourselves.
 * Tables are lifted the same way: Payload's experimental table feature breaks
 * under Next (duplicate `lexical` copies), so we emit table nodes manually for
 * the frontend `TableJSXConverter`.
 */
export function markdownToLexicalWithCodeBlocks(
  markdown: string,
  editorConfig: EditorConfig,
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
