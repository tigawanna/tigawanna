import { createHighlighter, type Highlighter } from "shiki";

const SHIKI_THEME = "github-dark";
const SHIKI_LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "json",
  "bash",
  "sql",
  "markdown",
  "html",
  "css",
  "text",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [SHIKI_THEME],
    langs: [...SHIKI_LANGS],
  });
  return highlighterPromise;
}

function decodeHtml(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function extractLang(classAttr: string) {
  const match = classAttr.match(/(?:language-|lang-)(\w+)/);
  return match?.[1] ?? "text";
}

function highlightCode(highlighter: Highlighter, code: string, lang: string) {
  const loaded = highlighter.getLoadedLanguages();
  const resolvedLang = loaded.includes(lang) ? lang : "text";

  return highlighter.codeToHtml(code, {
    lang: resolvedLang,
    theme: SHIKI_THEME,
  });
}

const codeBlockPattern = /<pre><code(?: class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;

export async function highlightHtmlCodeBlocks(html: string) {
  const highlighter = await getHighlighter();
  const matches = [...html.matchAll(codeBlockPattern)];

  if (matches.length === 0) {
    return html;
  }

  let result = html;
  let offset = 0;

  for (const match of matches) {
    const full = match[0];
    const classAttr = match[1] ?? "";
    const code = decodeHtml(match[2]);
    const lang = extractLang(classAttr);
    const highlighted = highlightCode(highlighter, code, lang);
    const index = result.indexOf(full, offset);

    if (index === -1) {
      continue;
    }

    result = result.slice(0, index) + highlighted + result.slice(index + full.length);
    offset = index + highlighted.length;
  }

  return result;
}
