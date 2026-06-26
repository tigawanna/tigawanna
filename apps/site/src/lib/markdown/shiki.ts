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

const CODE_BLOCK_RE = /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;

export async function highlightHtmlCodeBlocks(html: string) {
  const highlighter = await getHighlighter();
  const matches = [...html.matchAll(CODE_BLOCK_RE)];
  if (matches.length === 0) {
    return html;
  }

  let result = html;
  for (const match of matches) {
    const [whole, lang, encoded] = match;
    const code = decodeHtmlEntities(encoded ?? "");
    const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : "plaintext";
    const highlighted = highlighter.codeToHtml(code, {
      lang: language,
      theme: SHIKI_THEME,
    });
    result = result.replace(whole, highlighted);
  }

  return result;
}
