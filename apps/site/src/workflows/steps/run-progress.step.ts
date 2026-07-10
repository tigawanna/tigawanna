import { logEnrichmentError, logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import type { RunCounters } from "@/modules/project-enrichment/counters";
import {
  updateRunFailure,
  updateRunProgress,
  updateRunSuccess,
} from "@/modules/project-enrichment/run-records";

/**
 * Workflow step: persist in-flight run counters.
 */
export async function updateRunProgressStep(
  runId: string,
  counters: RunCounters,
  processedRepoCount: number,
) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "updateRunProgress",
    outcome: "success",
    counters,
  });

  try {
    await updateRunProgress(runId, counters, processedRepoCount);
  } catch (err: unknown) {
    logEnrichmentError(runId, "updateRunProgress", err, { counters });
    throw err;
  }
}

/**
 * Workflow step: mark run completed.
 */
export async function finalizeRunStep(runId: string, counters: RunCounters) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "finalizeRun",
    outcome: "started",
    counters,
  });

  try {
    await updateRunSuccess(runId, counters);
    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "finalizeRun",
      outcome: "success",
      counters,
    });
  } catch (err: unknown) {
    logEnrichmentError(runId, "finalizeRun", err, { counters });
    throw err;
  }
}

/**
 * Workflow step: mark run failed.
 */
export async function markRunFailedStep(runId: string, counters: RunCounters, message: string) {
  "use step";

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "markRunFailed",
    outcome: "started",
    counters,
    error: message,
  });

  try {
    await updateRunFailure(runId, counters, message);
    logEnrichmentEvent({
      workflow: "project-enrichment",
      runId,
      step: "markRunFailed",
      outcome: "failure",
      counters,
      error: message,
    });
  } catch (err: unknown) {
    logEnrichmentError(runId, "markRunFailed", err, { counters });
    throw err;
  }
}
