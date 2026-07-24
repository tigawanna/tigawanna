import { randomBytes } from "crypto";
import { convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { CODE_BLOCK_LANGUAGES, type CodeBlockLanguage } from "@/blocks/Code/config";

const FENCE_RE = /```([\w+-]*)\r?\n([\s\S]*?)```/g;

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
 * Normalizes GitHub-style callouts so Lexical markdown import stays readable.
 */
export function normalizeMarkdownCallouts(markdown: string): string {
  return markdown
    .replace(/^\[!TIP\]\s*$/gm, "> **Tip**")
    .replace(/^\[!NOTE\]\s*$/gm, "> **Note**")
    .replace(/^\[!WARNING\]\s*$/gm, "> **Warning**")
    .replace(/^\[!IMPORTANT\]\s*$/gm, "> **Important**");
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
 * Converts markdown to Lexical, lifting fenced code into Code blocks.
 *
 * Default `convertMarkdownToLexical` leaves ``` fences as plain paragraph text
 * when CodeFeature isn't in the editor config — so we split fences ourselves.
 */
export function markdownToLexicalWithCodeBlocks(
  markdown: string,
  editorConfig: Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"],
): DefaultTypedEditorState {
  const normalized = normalizeMarkdownCallouts(markdown);
  const children: DefaultTypedEditorState["root"]["children"] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FENCE_RE.lastIndex = 0;
  while ((match = FENCE_RE.exec(normalized)) !== null) {
    const prose = normalized.slice(lastIndex, match.index).trim();
    if (prose) {
      const lexical = convertMarkdownToLexical({
        editorConfig,
        markdown: prose,
      });
      children.push(...lexical.root.children);
    }

    children.push(
      createCodeBlockNode(
        match[1] ?? "",
        match[2].replace(/\n$/, ""),
      ) as unknown as (typeof children)[number],
    );
    lastIndex = match.index + match[0].length;
  }

  const trailing = normalized.slice(lastIndex).trim();
  if (trailing) {
    const lexical = convertMarkdownToLexical({
      editorConfig,
      markdown: trailing,
    });
    children.push(...lexical.root.children);
  }

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
