import type { PayloadJob } from "@/payload-types";

/**
 * Compact job row for the debug jobs UI / API.
 */
export type JobListItem = {
  id: number;
  taskSlug: PayloadJob["taskSlug"];
  workflowSlug: PayloadJob["workflowSlug"];
  queue: string | null;
  input: unknown;
  processing: boolean;
  completedAt: string | null;
  hasError: boolean;
  error: unknown;
  totalTried: number;
  waitUntil: string | null;
  log: PayloadJob["log"];
  createdAt: string;
  updatedAt: string;
  /** Derived lifecycle label for the UI. */
  status: "waiting" | "queued" | "processing" | "succeeded" | "failed";
};

/**
 * Maps a `payload-jobs` doc into a list row with a derived status.
 *
 * @param job - Payload job document.
 */
export function toJobListItem(job: PayloadJob): JobListItem {
  const waitUntil = job.waitUntil ?? null;
  const processing = job.processing ?? false;
  const completedAt = job.completedAt ?? null;
  const hasError = job.hasError ?? false;

  let status: JobListItem["status"] = "queued";
  if (hasError) {
    status = "failed";
  } else if (completedAt) {
    status = "succeeded";
  } else if (processing) {
    status = "processing";
  } else if (waitUntil && new Date(waitUntil).getTime() > Date.now()) {
    status = "waiting";
  }

  return {
    id: job.id,
    taskSlug: job.taskSlug ?? null,
    workflowSlug: job.workflowSlug ?? null,
    queue: job.queue ?? null,
    input: job.input ?? null,
    processing,
    completedAt,
    hasError,
    error: job.error ?? null,
    totalTried: job.totalTried ?? 0,
    waitUntil,
    log: job.log ?? [],
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    status,
  };
}

/**
 * Pulls a readable repo name from job input when present.
 *
 * @param input - Job input blob.
 */
export function jobInputLabel(input: unknown): string | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  if ("nameWithOwner" in input && typeof input.nameWithOwner === "string") {
    return input.nameWithOwner;
  }
  if ("message" in input && typeof input.message === "string") {
    return input.message.length > 48 ? `${input.message.slice(0, 48)}…` : input.message;
  }
  return null;
}
