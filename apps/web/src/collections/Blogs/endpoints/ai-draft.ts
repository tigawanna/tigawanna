import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { Endpoint } from "payload";
import { APIError } from "payload";
import { z } from "zod";

import {
  getDefaultOpenRouterModel,
  getOpenRouterApiKey,
  listCuratedOpenRouterModels,
  OPENROUTER_FALLBACK_MODELS,
} from "@/lib/openrouter/client";
import { generateBlogAiDraft } from "@/modules/blog-ai/generate-draft";
import { refineBlogDraft } from "@/modules/blog-ai/refine-draft";

const aiDraftBodySchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().min(10).max(20_000),
  references: z.array(z.string().max(2000)).max(8).optional(),
  model: z.string().min(1).max(200).optional(),
});

const aiRefineBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.unknown(),
  instruction: z.string().min(5).max(10_000),
  model: z.string().min(1).max(200).optional(),
});

/**
 * Normalizes optional reference lines into absolute http(s) URLs.
 */
function normalizeReferences(raw: string[] | undefined): string[] | undefined {
  if (!raw || raw.length === 0) return undefined;
  const urls: string[] = [];
  for (const item of raw) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      if (url.protocol === "http:" || url.protocol === "https:") {
        urls.push(url.toString());
      }
    } catch {
      // skip invalid
    }
  }
  return urls.length > 0 ? urls : undefined;
}

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
 * GET /api/blogs/ai-draft/status — whether OpenRouter is configured + default model.
 */
export const aiDraftStatusEndpoint: Endpoint = {
  path: "/ai-draft/status",
  method: "get",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const configured = Boolean(getOpenRouterApiKey());
    return Response.json({
      configured,
      defaultModel: getDefaultOpenRouterModel(),
      fallbackModels: [...OPENROUTER_FALLBACK_MODELS],
    });
  },
};

/**
 * GET /api/blogs/ai-draft/models — curated OpenRouter model list for the admin picker.
 */
export const aiDraftModelsEndpoint: Endpoint = {
  path: "/ai-draft/models",
  method: "get",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    return Response.json({
      configured: Boolean(getOpenRouterApiKey()),
      defaultModel: getDefaultOpenRouterModel(),
      models: listCuratedOpenRouterModels(),
    });
  },
};

/**
 * POST /api/blogs/ai-draft — generate a draft blog post via OpenRouter.
 */
export const aiDraftEndpoint: Endpoint = {
  path: "/ai-draft",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    if (!getOpenRouterApiKey()) {
      throw new APIError("OPENROUTER_API_KEY is not set. Add it to enable Smart draft.", 503);
    }

    let body: unknown;
    try {
      body = await req.json?.();
    } catch {
      throw new APIError("Invalid JSON body", 400);
    }

    const parsed = aiDraftBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    try {
      const result = await generateBlogAiDraft(
        req.payload,
        {
          title: parsed.data.title,
          notes: parsed.data.notes,
          model: parsed.data.model,
          references: normalizeReferences(parsed.data.references),
        },
        { user: req.user },
      );
      return Response.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate Smart draft";
      throw new APIError(message, 400);
    }
  },
};

/**
 * POST /api/blogs/ai-refine — refine current edit-view fields via OpenRouter (no save).
 */
export const aiRefineEndpoint: Endpoint = {
  path: "/ai-refine",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    if (!getOpenRouterApiKey()) {
      throw new APIError("OPENROUTER_API_KEY is not set. Add it to enable Smart refine.", 503);
    }

    let body: unknown;
    try {
      body = await req.json?.();
    } catch {
      throw new APIError("Invalid JSON body", 400);
    }

    const parsed = aiRefineBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    if (!isLexicalState(parsed.data.content)) {
      throw new APIError("Content must be Lexical editor JSON.", 400);
    }

    try {
      const result = await refineBlogDraft(req.payload.config, {
        title: parsed.data.title,
        description: parsed.data.description,
        content: parsed.data.content,
        instruction: parsed.data.instruction,
        model: parsed.data.model,
      });
      return Response.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to refine draft";
      throw new APIError(message, 400);
    }
  },
};
