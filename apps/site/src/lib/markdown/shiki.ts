import { createHighlighter, type Highlighter } from "shiki";

const SHIKI_THEME = "github-dark";
const SHIKI_LANGS = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "shell",
  "sql",
  "yaml",
  "markdown",
  "html",
  "css",
  "diff",
  "plaintext",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEME],
      langs: [...SHIKI_LANGS],
    });
  }
  return highlighterPromise;
}

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
};

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

function resolveLanguage(highlighter: Highlighter, classAttr: string | undefined) {
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
