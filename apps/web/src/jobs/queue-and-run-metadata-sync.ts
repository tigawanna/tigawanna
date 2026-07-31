import type { Payload } from "payload";

import { GITHUB_SYNC_QUEUE } from "@/jobs/queues";

export type QueueGithubMetadataSyncResult = {
  jobId: number | string;
  created: number;
  updated: number;
  upserted: number;
  skipped: number;
  featured: number;
  pulledAt: string;
};

/**
 * Reads a numeric field from task output with a fallback.
 *
 * @param output - Task output object.
 * @param key - Output key.
 * @param fallback - Default when missing.
 */
function num(
  output: Record<string, unknown> | null | undefined,
  key: string,
  fallback = 0,
): number {
  const value = output?.[key];
  return typeof value === "number" ? value : fallback;
}

/**
 * Queues `listAndUpsertRepos` and runs the `github-sync` queue once (limit 1).
 *
 * @param payload - Payload instance.
 * @param input - Optional task input (e.g. `recentLimit`).
 */
export async function queueAndRunGithubMetadataSync(
  payload: Payload,
  input: { recentLimit?: number } = {},
): Promise<QueueGithubMetadataSyncResult> {
  const queued = await payload.jobs.queue({
    task: "listAndUpsertRepos",
    queue: GITHUB_SYNC_QUEUE,
    input,
  });

  await payload.jobs.run({
    queue: GITHUB_SYNC_QUEUE,
    limit: 1,
  });

  const job = await payload.findByID({
    collection: "payload-jobs",
    id: queued.id,
    depth: 0,
    overrideAccess: true,
  });

  if (job.hasError) {
    const message =
      job.error && typeof job.error === "object" && "message" in job.error
        ? String(job.error.message)
        : "listAndUpsertRepos failed";
    throw new Error(message);
  }

  const logEntry = job.log?.find(
    (entry) => entry.taskSlug === "listAndUpsertRepos" && entry.state === "succeeded",
  );
  const output =
    logEntry?.output && typeof logEntry.output === "object" && !Array.isArray(logEntry.output)
      ? (logEntry.output as Record<string, unknown>)
      : undefined;

  return {
    jobId: queued.id,
    created: num(output, "created"),
    updated: num(output, "updated"),
    upserted: num(output, "upserted"),
    skipped: num(output, "skipped"),
    featured: num(output, "featured"),
    pulledAt: typeof output?.pulledAt === "string" ? output.pulledAt : new Date().toISOString(),
  };
}
