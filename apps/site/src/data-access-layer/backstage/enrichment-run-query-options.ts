import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getProjectEnrichmentRun } from "@/modules/backstage/projects-enrichment.functions";
import { queryOptions } from "@tanstack/react-query";

/**
 * Parses the JSON-encoded repo list stored on enrichment runs.
 */
export function parseEnrichmentTargetRepos(raw: string | null | undefined) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

export function projectEnrichmentRunQueryOptions(runId: string) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "project-enrichment", "run", runId],
    queryFn: () => getProjectEnrichmentRun({ data: { runId } }),
  });
}
