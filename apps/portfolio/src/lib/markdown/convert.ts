import showdown from "showdown";
import { highlightHtmlCodeBlocks } from "@/lib/markdown/shiki";

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

export async function convertMarkdownToHtmlWithShiki(markdown: string): Promise<string> {
  const html = convertMarkdownToBaseHtml(markdown);
  return highlightHtmlCodeBlocks(html);
}

export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  return convertMarkdownToHtmlWithShiki(markdown);
}
