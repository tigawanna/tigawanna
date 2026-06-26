import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const SHIKI_THEME = "github-dark";

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-dark")],
    langs: [
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/css"),
    ],
    engine: createJavaScriptRegexEngine(),
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

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightCode(highlighter: HighlighterCore, code: string, lang: string) {
  const loaded = highlighter.getLoadedLanguages();
  const resolvedLang = loaded.includes(lang) ? lang : null;

  if (!resolvedLang || !loaded.includes(resolvedLang)) {
    return `<pre class="shiki github-dark" style="background-color:#0d1117;color:#e6edf3"><code>${escapeHtml(code)}</code></pre>`;
  }

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
