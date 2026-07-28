import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { Payload, TypedUser } from "payload";
import { z } from "zod";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";
import {
  extractJsonObject,
  getDefaultOpenRouterModel,
  openRouterChatCompletion,
  requireOpenRouterApiKey,
} from "@/lib/openrouter/client";
import { BLOG_AI_STYLE_RULES } from "@/modules/blog-ai/refine-draft";

const aiDraftSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  markdown: z.string().min(40),
  tags: z.array(z.string().min(1).max(32)).max(8).optional().default([]),
});

export type AiDraftInput = {
  /** Working title or topic — may be refined by the model. */
  title: string;
  /** Rough notes / outline / bullet ideas to expand into an article. */
  notes: string;
  /** Optional reference URLs the model can mention (not fetched). */
  references?: string[];
  /** OpenRouter model id. */
  model?: string;
};

export type AiDraftResult = {
  id: number | string;
  title: string;
  description: string;
  slug: string | null | undefined;
  model: string;
  tags: string[];
};

type GenerateOptions = {
  user?: TypedUser | null;
};

/**
 * Builds the OpenRouter prompt for a first-pass blog draft.
 */
function buildDraftPrompt(input: AiDraftInput): string {
  const refs =
    input.references && input.references.length > 0
      ? `\nReference links (cite only if relevant; do not invent URLs):\n${input.references.map((u) => `- ${u}`).join("\n")}`
      : "";

  return `You are a technical blog writing assistant for a developer portfolio.

Turn the author's rough notes into a polished first-draft article in Markdown.

Working title / topic: ${input.title.trim()}

Author notes:
${input.notes.trim()}
${refs}

Requirements:
- Expand the notes into a clear, structured article with depth (intro, sections, concrete examples, short conclusion).
${BLOG_AI_STYLE_RULES}
- Tags should be short lowercase Dev.to-style tags (e.g. javascript, nextjs), max 4.

Respond with a single JSON object only (no markdown fences) matching:
{
  "title": "string",
  "description": "1-2 sentence summary for cards/SEO",
  "markdown": "full article body in markdown",
  "tags": ["tag1", "tag2"]
}`;
}

/**
 * Slugifies a title for Payload when the slug field needs an initial value.
 */
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Generates an AI blog draft via OpenRouter and creates a Payload draft post.
 */
export async function generateBlogAiDraft(
  payload: Payload,
  input: AiDraftInput,
  options: GenerateOptions = {},
): Promise<AiDraftResult> {
  const titleHint = input.title.trim();
  const notes = input.notes.trim();

  if (!titleHint) {
    throw new Error("Title / topic is required.");
  }
  if (notes.length < 10) {
    throw new Error("Add a bit more detail in the notes (at least a few sentences or bullets).");
  }

  const apiKey = requireOpenRouterApiKey();
  const model = input.model?.trim() || getDefaultOpenRouterModel();
  const access = {
    user: options.user ?? undefined,
    overrideAccess: !options.user,
  };

  const raw = await openRouterChatCompletion({
    apiKey,
    model,
    prompt: buildDraftPrompt(input),
    temperature: 0.55,
  });

  let parsed: z.infer<typeof aiDraftSchema>;
  try {
    parsed = aiDraftSchema.parse(JSON.parse(extractJsonObject(raw)));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid AI response";
    throw new Error(`Smart draft parse failed: ${message}`);
  }

  const editorConfig = await getContentEditorConfig(payload.config);
  const content = markdownToLexicalWithCodeBlocks(
    parsed.markdown,
    editorConfig,
  ) as DefaultTypedEditorState;

  const tags = parsed.tags
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, ""))
    .filter(Boolean)
    .slice(0, 4)
    .map((tag) => ({ tag }));

  const slug = slugifyTitle(parsed.title);

  const doc = await payload.create({
    collection: "blogs",
    data: {
      title: parsed.title,
      description: parsed.description,
      content,
      kind: "post",
      slug,
      ...(tags.length > 0 ? { tags } : {}),
    },
    draft: true,
    context: { disableRevalidate: true },
    ...access,
  });

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    slug: doc.slug,
    model,
    tags: tags.map((row) => row.tag),
  };
}
