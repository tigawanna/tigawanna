import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { SanitizedConfig } from "payload";
import { z } from "zod";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { lexicalToMarkdownWithBlocks } from "@/lib/lexical-to-markdown";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";
import {
  extractJsonObject,
  getDefaultOpenRouterModel,
  openRouterChatCompletion,
  requireOpenRouterApiKey,
} from "@/lib/openrouter/client";

/** Shared style rules for Smart draft / Smart refine prompts. */
export const BLOG_AI_STYLE_RULES = `- Write in a direct, first-person developer voice. No fluff, no emojis, no SEO keyword stuffing.
- Never use em dashes (—). Prefer commas, periods, colons, parentheses, or a spaced hyphen (-) instead.
- Include practical fenced code snippets with language tags whenever they clarify a point (commands, configs, short examples). Prefer small, real snippets over pseudocode when possible.
- Use Markdown: ## / ### headings, lists, fenced code blocks with language tags when useful.
- Do NOT include a top-level # title heading; title is a separate field.
- Do NOT invent images or image URLs; leave image placeholders out (the author adds those on Dev.to later).`;

const refineSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  markdown: z.string().min(40),
});

export type RefineBlogInput = {
  title: string;
  description: string;
  /** Current Lexical editor JSON from the admin form. */
  content: DefaultTypedEditorState;
  /** What the author wants changed. */
  instruction: string;
  model?: string;
};

export type RefineBlogResult = {
  title: string;
  description: string;
  content: DefaultTypedEditorState;
  model: string;
};

/**
 * Builds the OpenRouter prompt for refining an existing blog draft.
 */
function buildRefinePrompt(input: {
  title: string;
  description: string;
  markdown: string;
  instruction: string;
}): string {
  return `You are a technical blog writing assistant for a developer portfolio.

Refine the existing draft according to the author's instructions. Keep what still works; change what they asked for. Return a full updated article (not a diff).

Current title: ${input.title.trim()}

Current description:
${input.description.trim()}

Current article (Markdown):
${input.markdown.trim()}

Author refine instructions:
${input.instruction.trim()}

Requirements:
${BLOG_AI_STYLE_RULES}
- Preserve the author's voice and intent unless the instructions say otherwise.
- Keep useful existing code snippets unless the instructions ask to change them.
- Tags are not needed in this response.

Respond with a single JSON object only (no markdown fences) matching:
{
  "title": "string",
  "description": "1-2 sentence summary for cards/SEO",
  "markdown": "full updated article body in markdown"
}`;
}

/**
 * Refines an in-progress blog draft via OpenRouter (does not save to Payload).
 */
export async function refineBlogDraft(
  config: SanitizedConfig,
  input: RefineBlogInput,
): Promise<RefineBlogResult> {
  const instruction = input.instruction.trim();
  if (instruction.length < 5) {
    throw new Error("Add a short refine instruction (what should change).");
  }
  if (!input.title.trim()) {
    throw new Error("Title is empty.");
  }
  if (!input.content?.root) {
    throw new Error("Content is empty.");
  }

  const apiKey = requireOpenRouterApiKey();
  const model = input.model?.trim() || getDefaultOpenRouterModel();
  const editorConfig = await getContentEditorConfig(config);

  const markdown = lexicalToMarkdownWithBlocks(input.content, editorConfig);
  if (!markdown.trim()) {
    throw new Error("Converted markdown is empty — add some content first.");
  }

  const raw = await openRouterChatCompletion({
    apiKey,
    model,
    prompt: buildRefinePrompt({
      title: input.title,
      description: input.description,
      markdown,
      instruction,
    }),
    temperature: 0.45,
  });

  let parsed: z.infer<typeof refineSchema>;
  try {
    parsed = refineSchema.parse(JSON.parse(extractJsonObject(raw)));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid AI response";
    throw new Error(`Smart refine parse failed: ${message}`);
  }

  const content = markdownToLexicalWithCodeBlocks(
    parsed.markdown,
    editorConfig,
  ) as DefaultTypedEditorState;

  return {
    title: parsed.title,
    description: parsed.description,
    content,
    model,
  };
}
