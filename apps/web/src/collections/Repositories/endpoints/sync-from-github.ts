import type { Endpoint } from "payload";
import { APIError } from "payload";

import { syncRepositoriesFromGithub } from "@/modules/github/sync-repositories-from-github";

/**
 * POST /api/repositories/sync-from-github — pull pinned + recent repos into Payload.
 */
export const syncFromGithubEndpoint: Endpoint = {
  path: "/sync-from-github",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    try {
      const result = await syncRepositoriesFromGithub(req.payload, { user: req.user });
      return Response.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sync from GitHub";
      const status =
        err instanceof Error && "status" in err && typeof err.status === "number"
          ? err.status
          : 400;
      throw new APIError(message, status >= 400 && status < 600 ? status : 400);
    }
  },
};
