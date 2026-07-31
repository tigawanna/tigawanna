import { getPayload } from "payload";
import config from "@payload-config";

import { queueAndRunGithubMetadataSync } from "@/jobs/queue-and-run-metadata-sync";

/**
 * Returns whether the request carries a valid Vercel cron / manual bearer secret.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/**
 * Daily (and on-demand) GitHub → Payload metadata sync via Payload Jobs.
 *
 * Queues + runs `listAndUpsertRepos` only (no enrichment enqueue).
 *
 * Secured with `CRON_SECRET`. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 */
async function handleSync(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });
    const result = await queueAndRunGithubMetadataSync(payload);
    return Response.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Repository sync failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
