import type { Endpoint } from "payload";
import { APIError } from "payload";
import { z } from "zod";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { stripDevtoFrontmatter } from "@/lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";

const fromMarkdownBodySchema = z.object({
  markdown: z.string().min(1).max(500_000),
  /** When true (default), a leading `# Title` becomes the title field. */
  applyTitle: z.boolean().optional().default(true),
});

/**
 * Pulls a leading H1 title out of markdown when present.
 */
function splitTitleFromMarkdown(markdown: string): { title: string | null; body: string } {
  const trimmed = markdown.trim();
  const match = trimmed.match(/^#\s+([^\n]+)\n+([\s\S]*)$/);
  if (!match) {
    return { title: null, body: trimmed };
  }
  return {
    title: match[1].trim() || null,
    body: match[2].trim(),
  };
}

/**
 * POST /api/blogs/from-markdown — paste markdown → Lexical content (+ optional title).
 */
export const fromMarkdownEndpoint: Endpoint = {
  path: "/from-markdown",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    let body: unknown;
    try {
      body = await req.json?.();
    } catch {
      throw new APIError("Invalid JSON body", 400);
    }

    const parsed = fromMarkdownBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    try {
      const withoutFrontmatter = stripDevtoFrontmatter(parsed.data.markdown);
      const { title, body: articleBody } = splitTitleFromMarkdown(withoutFrontmatter);
      const markdownForBody = articleBody || withoutFrontmatter.trim();

      if (!markdownForBody) {
        throw new Error("Markdown is empty after stripping front matter / title.");
      }

      const editorConfig = await getContentEditorConfig(req.payload.config);
      const content = markdownToLexicalWithCodeBlocks(markdownForBody, editorConfig);

      return Response.json({
        content,
        title: parsed.data.applyTitle ? title : null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to import markdown";
      throw new APIError(message, 400);
    }
  },
};
