import type { Endpoint } from "payload";
import { APIError } from "payload";

import { queueAndRunGithubMetadataSync } from "@/jobs/queue-and-run-metadata-sync";

/**
 * POST /api/repositories/sync-from-github — queue + run GitHub metadata sync job.
 */
export const syncFromGithubEndpoint: Endpoint = {
  path: "/sync-from-github",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    try {
      const result = await queueAndRunGithubMetadataSync(req.payload);
      return Response.json({ ok: true, ...result });
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
