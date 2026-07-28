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

const aiDraftBodySchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().min(10).max(20_000),
  references: z.array(z.string().max(2000)).max(8).optional(),
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
      throw new APIError("OPENROUTER_API_KEY is not set. Add it to enable AI drafts.", 503);
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
      const message = err instanceof Error ? err.message : "Failed to generate AI draft";
      throw new APIError(message, 400);
    }
  },
};
