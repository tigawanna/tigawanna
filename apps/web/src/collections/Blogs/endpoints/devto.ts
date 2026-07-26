import type { Endpoint } from "payload";
import { APIError } from "payload";

import { openBlogOnDevto } from "@/modules/devto/open-on-devto";
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
      const message = err instanceof Error ? err.message : "Failed to open on Dev.to";
      const status =
        err instanceof Error && "status" in err && typeof err.status === "number"
          ? err.status
          : 400;
      throw new APIError(message, status >= 400 && status < 600 ? status : 400);
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
      const message = err instanceof Error ? err.message : "Failed to sync from Dev.to";
      const status =
        err instanceof Error && "status" in err && typeof err.status === "number"
          ? err.status
          : 400;
      throw new APIError(message, status >= 400 && status < 600 ? status : 400);
    }
  },
};
