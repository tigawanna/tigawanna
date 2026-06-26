import hljs from "highlight.js";
import showdown from "showdown";

function htmlUnencode(text: string): string {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

showdown.extension("highlight", () => [
  {
    type: "output",
    filter: (text: string) => {
      const left = "<pre><code\\b[^>]*>";
      const right = "</code></pre>";
      const flags = "g";

      const replacement = (
        _wholeMatch: string,
        match: string,
        leftPart: string,
        rightPart: string,
      ): string => {
        const decoded = htmlUnencode(match);
        const lang = (leftPart.match(/class="([^ "]+)/) || [])[1];
        const updatedLeft = leftPart.slice(0, 18) + "hljs " + leftPart.slice(18);
        if (lang && hljs.getLanguage(lang)) {
          return updatedLeft + hljs.highlight(decoded, { language: lang }).value + rightPart;
        }
        return updatedLeft + hljs.highlightAuto(decoded).value + rightPart;
      };

      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    },
  },
]);

const converter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  simpleLineBreaks: true,
  ghMentions: true,
  extensions: ["highlight"],
  tables: true,
});

const baseConverter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  simpleLineBreaks: true,
  ghMentions: true,
  tables: true,
});

function applyCalloutReplacements(html: string): string {
  return html
    .replace("<p>[!NOTE]", "<p class='note'><span> 📝 Note</span>")
    .replace("<p>[!TIP]", "<p class='tip'><span>💡 Tip </span>")
    .replace("<p>[!WARNING]", "<p class='warning'> <span> 🚨 Warning </span>")
    .replace("<p>[!IMPORTANT]", "<p class='important'><span> 🔥 Important </span>")
    .replace("<p>[!CAUTION]", "<p class='caution'> <span>⚠️ Caution </span>");
}

export function convertMarkdownToBaseHtml(markdown: string): string {
  return applyCalloutReplacements(baseConverter.makeHtml(markdown));
}

export function convertMarkdownToHtml(markdown: string): string {
  return applyCalloutReplacements(converter.makeHtml(markdown));
}

export async function convertMarkdownToHtmlWithShiki(markdown: string): Promise<string> {
  return convertMarkdownToHtml(markdown);
}
