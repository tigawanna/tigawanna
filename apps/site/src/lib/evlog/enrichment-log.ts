import { getRequestLog } from "@/lib/evlog/get-request-log";
import type { RepoProcessDelta, RunCounters } from "@/modules/project-enrichment/counters";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";

export type EnrichmentLogEvent = {
  workflow: "project-enrichment";
  runId: string;
  step: string;
  outcome: "started" | "success" | "failure" | "skipped";
  trigger?: EnrichmentRunParams["trigger"];
  repoFullName?: string;
  repoCount?: number;
  force?: boolean;
  counters?: RunCounters;
  delta?: RepoProcessDelta;
  error?: string;
};

/**
 * Emits a structured enrichment workflow event through evlog.
 *
 * @param event - Wide-event fields for a workflow step or run boundary.
 */
export function logEnrichmentEvent(event: EnrichmentLogEvent) {
  try {
    getRequestLog().set({ enrichment: event });
  } catch {
    return;
  }
}

/**
 * Logs a workflow failure and attaches the error to the current evlog event.
 *
 * @param runId - Enrichment run identifier.
 * @param step - Workflow step name where the failure occurred.
 * @param err - Thrown error value.
 * @param context - Optional enrichment context fields.
 */
export function logEnrichmentError(
  runId: string,
  step: string,
  err: unknown,
  context?: Pick<EnrichmentLogEvent, "trigger" | "repoFullName" | "counters">,
) {
  const message = err instanceof Error ? err.message : String(err);

  try {
    const log = getRequestLog();
    log.set({
      enrichment: {
        workflow: "project-enrichment",
        runId,
        step,
        outcome: "failure",
        error: message,
        ...context,
      },
    });
    if (err instanceof Error) {
      log.error(err, { enrichment: { runId, step } });
    }
  } catch {
    return;
  }
}
