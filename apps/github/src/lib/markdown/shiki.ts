import { createHighlighterCore, type HighlighterCore, type LanguageInput } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const SHIKI_THEME = "github-dark";

/**
 * Only these grammars are shipped. Unknown fence langs fall back to plaintext
 * (a Shiki special language — no grammar pack required).
 * Fine-grained `@shikijs/langs/*` imports keep Nitro from packaging the full langs pack.
 */
const SHIKI_LANG_LOADERS: LanguageInput[] = [
  () => import("@shikijs/langs/typescript"),
  () => import("@shikijs/langs/javascript"),
  () => import("@shikijs/langs/tsx"),
  () => import("@shikijs/langs/jsx"),
  () => import("@shikijs/langs/json"),
  () => import("@shikijs/langs/bash"),
  () => import("@shikijs/langs/sql"),
  () => import("@shikijs/langs/yaml"),
  () => import("@shikijs/langs/markdown"),
  () => import("@shikijs/langs/html"),
  () => import("@shikijs/langs/css"),
  () => import("@shikijs/langs/diff"),
];

let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Lazily creates a highlighter with only the languages we format in markdown.
 */
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("@shikijs/themes/github-dark")],
      langs: SHIKI_LANG_LOADERS,
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

/**
 * Decodes HTML entities Showdown leaves inside `<code>` blocks.
 */
function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  text: "plaintext",
  txt: "plaintext",
};

/**
 * Reads a Showdown `language-*` class into a Shiki language id.
 */
function extractLanguage(classAttr: string | undefined) {
  if (!classAttr) {
    return undefined;
  }

  const classes = classAttr.split(/\s+/).filter(Boolean);
  const prefixed = classes.find((className) => className.startsWith("language-"));
  const raw = prefixed?.slice("language-".length) ?? classes[0];
  if (!raw) {
    return undefined;
  }

  return LANG_ALIASES[raw] ?? raw;
}

/**
 * Picks a loaded language, otherwise plaintext.
 */
function resolveLanguage(highlighter: HighlighterCore, classAttr: string | undefined) {
  const language = extractLanguage(classAttr);
  if (!language) {
    return "plaintext";
  }

  const loaded = highlighter.getLoadedLanguages();
  if (loaded.includes(language)) {
    return language;
  }

  const aliased = LANG_ALIASES[language];
  if (aliased && loaded.includes(aliased)) {
    return aliased;
  }

  return "plaintext";
}

const CODE_BLOCK_RE = /<pre><code(?: class="([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;

/**
 * Replaces Showdown `<pre><code>` blocks with Shiki-highlighted HTML.
 */
export async function highlightHtmlCodeBlocks(html: string) {
  const highlighter = await getHighlighter();
  const matches = [...html.matchAll(CODE_BLOCK_RE)];
  if (matches.length === 0) {
    return html;
  }

  let result = html;
  for (const match of matches) {
    const [whole, classAttr, encoded] = match;
    const code = decodeHtmlEntities(encoded ?? "");
    const language = resolveLanguage(highlighter, classAttr);
    const highlighted = highlighter.codeToHtml(code, {
      lang: language,
      theme: SHIKI_THEME,
    });
    result = result.replace(whole, highlighted);
  }

  return result;
}
