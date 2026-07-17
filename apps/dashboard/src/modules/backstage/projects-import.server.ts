import { logEnrichmentEvent } from "@/lib/evlog/enrichment-log";
import { getDb } from "@/lib/db/get-db.server";
import { eq, projectRepos } from "@repo/db";
import { createRunRecord } from "@/modules/project-enrichment/run-enrichment";
import { runProjectEnrichment } from "@/modules/project-enrichment/run-project-enrichment";
import type { EnrichmentRunParams } from "@/modules/project-enrichment/types";

type ImportWorkflowInput = {
  runEnrichment?: boolean;
  forceEnrichment?: boolean;
};

/**
 * Deletes a project row by repository full name.
 */
export async function deleteProjectRepoByFullName(fullName: string) {
  const db = getDb();
  await db.delete(projectRepos).where(eq(projectRepos.repoFullName, fullName));
}

/**
 * Runs metadata enrichment for imported repos when requested.
 */
export async function runImportEnrichment(repoFullNames: string[], data: ImportWorkflowInput) {
  if (data.runEnrichment !== true) {
    return null;
  }

  const runId = await createRunRecord("manual", repoFullNames);
  const forceEnrichment = data.forceEnrichment ?? (repoFullNames.length === 1 ? true : false);

  const params: EnrichmentRunParams = {
    runId,
    trigger: "manual",
    limit: repoFullNames.length,
    repos: repoFullNames,
    force: forceEnrichment,
    runEnrichment: true,
  };

  logEnrichmentEvent({
    workflow: "project-enrichment",
    runId,
    step: "startEnrichment",
    outcome: "started",
    trigger: "manual",
    repoCount: repoFullNames.length,
    force: forceEnrichment,
  });

  await runProjectEnrichment(params);
  return runId;
}
