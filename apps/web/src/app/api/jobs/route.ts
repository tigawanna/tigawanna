import type { Where } from "payload";

import { toJobListItem } from "@/jobs/job-list-item";
import { GITHUB_ENRICH_QUEUE, GITHUB_SYNC_QUEUE } from "@/jobs/queues";
import { requirePayloadUser } from "@/jobs/require-payload-user";

const QUEUE_FILTERS = new Set(["all", "github", GITHUB_SYNC_QUEUE, GITHUB_ENRICH_QUEUE, "default"]);
const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 100;

/**
 * Builds a Payload where clause for the jobs queue filter.
 *
 * @param queueParam - Filter key from the query string.
 */
function jobsWhereForQueue(queueParam: string): Where | undefined {
  if (queueParam === "all") return undefined;
  if (queueParam === "github") {
    return {
      or: [{ queue: { equals: GITHUB_SYNC_QUEUE } }, { queue: { equals: GITHUB_ENRICH_QUEUE } }],
    };
  }
  if (queueParam === "default") {
    return {
      or: [{ queue: { equals: "default" } }, { queue: { exists: false } }],
    };
  }
  return { queue: { equals: queueParam } };
}

/**
 * Lists recent `payload-jobs` for the admin jobs progress view.
 * Query: `?queue=all|github|github-sync|github-enrich|default&page=1&limit=60`
 * Requires a logged-in Payload admin session.
 *
 * Sort prefers currently processing jobs, then newest.
 */
export async function GET(request: Request) {
  const auth = await requirePayloadUser();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queueParam = url.searchParams.get("queue")?.trim() || "github";
  const pageRaw = Number(url.searchParams.get("page") ?? "1");
  const limitRaw = Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT));
  const page = Number.isFinite(pageRaw) ? Math.max(Math.floor(pageRaw), 1) : 1;
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (!QUEUE_FILTERS.has(queueParam)) {
    return Response.json(
      { error: `Invalid queue. Use one of: ${[...QUEUE_FILTERS].join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const { payload } = auth;
    const where = jobsWhereForQueue(queueParam);

    const result = await payload.find({
      collection: "payload-jobs",
      where,
      limit,
      page,
      pagination: true,
      // Processing (true) first, then newest — SQLite stores checkbox as 0/1.
      sort: ["-processing", "-createdAt"],
      depth: 0,
      overrideAccess: true,
    });

    const jobs = result.docs.map(toJobListItem);
    const totalPages = result.totalPages ?? 1;
    const currentPage = result.page ?? page;

    return Response.json({
      ok: true,
      queue: queueParam,
      page: currentPage,
      limit,
      totalDocs: result.totalDocs,
      totalPages,
      hasNextPage: result.hasNextPage ?? currentPage < totalPages,
      hasPrevPage: result.hasPrevPage ?? currentPage > 1,
      jobs,
      counts: {
        waiting: jobs.filter((j) => j.status === "waiting").length,
        queued: jobs.filter((j) => j.status === "queued").length,
        processing: jobs.filter((j) => j.status === "processing").length,
        succeeded: jobs.filter((j) => j.status === "succeeded").length,
        failed: jobs.filter((j) => j.status === "failed").length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list jobs";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
