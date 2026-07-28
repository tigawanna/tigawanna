import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { Endpoint } from "payload";
import { APIError } from "payload";
import { z } from "zod";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { lexicalToMarkdownWithBlocks } from "@/lib/lexical-to-markdown";

const toMarkdownBodySchema = z.object({
  title: z.string().max(200).optional(),
  content: z.unknown(),
});

/**
 * Narrows unknown form JSON to a Lexical editor state.
 */
function isLexicalState(value: unknown): value is DefaultTypedEditorState {
  if (!value || typeof value !== "object") return false;
  if (!("root" in value)) return false;
  const root = (value as { root: unknown }).root;
  if (!root || typeof root !== "object") return false;
  return (
    "children" in root &&
    Array.isArray((root as { children: unknown }).children) &&
    "type" in root &&
    (root as { type: unknown }).type === "root"
  );
}

/**
 * POST /api/blogs/to-markdown — Lexical content (from edit form) → markdown string.
 */
export const toMarkdownEndpoint: Endpoint = {
  path: "/to-markdown",
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

    const parsed = toMarkdownBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    if (!isLexicalState(parsed.data.content)) {
      throw new APIError("Content must be Lexical editor JSON.", 400);
    }

    try {
      const editorConfig = await getContentEditorConfig(req.payload.config);
      const bodyMarkdown = lexicalToMarkdownWithBlocks(parsed.data.content, editorConfig);
      if (!bodyMarkdown.trim()) {
        throw new Error("Converted markdown is empty.");
      }

      const title = parsed.data.title?.trim();
      const markdown = title ? `# ${title}\n\n${bodyMarkdown}` : bodyMarkdown;

      return Response.json({ markdown });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to convert to markdown";
      throw new APIError(message, 400);
    }
  },
};
