import type { Endpoint } from "payload";
import { APIError } from "payload";
import { z } from "zod";

import { importDevtoArticle } from "@/modules/devto/import-from-devto";
import { openBlogOnDevto } from "@/modules/devto/open-on-devto";
import { getDevtoOverview } from "@/modules/devto/overview";
import { syncBlogFromDevto } from "@/modules/devto/sync-from-devto";

/**
 * Reads `:id` from a collection custom endpoint path.
 */
function requireRouteId(routeParams: Record<string, unknown> | undefined): string {
  const id = routeParams?.id;
  if (typeof id === "string" || typeof id === "number") return String(id);
  throw new APIError("Missing blog id", 400);
}

/**
 * Converts an unknown failure into an `APIError`, keeping upstream 4xx/5xx statuses.
 */
function toApiError(err: unknown, fallback: string): APIError {
  const message = err instanceof Error ? err.message : fallback;
  const status =
    err instanceof Error && "status" in err && typeof err.status === "number" ? err.status : 400;
  return new APIError(message, status >= 400 && status < 600 ? status : 400);
}

const importArticleBodySchema = z.object({
  articleId: z.number().int().positive(),
});

/**
 * GET /api/blogs/devto/overview — Dev.to articles matched to local blogs (admin Dev.to page).
 */
export const devtoOverviewEndpoint: Endpoint = {
  path: "/devto/overview",
  method: "get",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    try {
      return Response.json(await getDevtoOverview(req.payload));
    } catch (err: unknown) {
      throw toApiError(err, "Failed to load Dev.to overview");
    }
  },
};

/**
 * POST /api/blogs/devto/import — import one published Dev.to article.
 *
 * Body: `{ articleId: number }`. Returns the outcome plus the article's fresh overview row.
 */
export const devtoImportArticleEndpoint: Endpoint = {
  path: "/devto/import",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const body: unknown = await req.json?.().catch(() => null);
    const parsed = importArticleBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new APIError("Body must be { articleId: number }", 400);
    }

    try {
      return Response.json(await importDevtoArticle(req.payload, parsed.data.articleId));
    } catch (err: unknown) {
      throw toApiError(err, "Failed to import from Dev.to");
    }
  },
};

/**
 * POST /api/blogs/:id/open-devto — seed/update a Dev.to draft and return edit URL.
 */
export const openDevtoEndpoint: Endpoint = {
  path: "/:id/open-devto",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const id = requireRouteId(req.routeParams);

    try {
      const result = await openBlogOnDevto(req.payload, id, { user: req.user });
      return Response.json(result);
    } catch (err: unknown) {
      throw toApiError(err, "Failed to open on Dev.to");
    }
  },
};

/**
 * POST /api/blogs/:id/sync-devto — pull Dev.to markdown/cover into this blog.
 */
export const syncDevtoEndpoint: Endpoint = {
  path: "/:id/sync-devto",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const id = requireRouteId(req.routeParams);

    try {
      const result = await syncBlogFromDevto(req.payload, id, { user: req.user });
      return Response.json(result);
    } catch (err: unknown) {
      throw toApiError(err, "Failed to sync from Dev.to");
    }
  },
};
