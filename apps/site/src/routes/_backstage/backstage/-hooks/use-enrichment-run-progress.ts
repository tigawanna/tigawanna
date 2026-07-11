import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getProjectEnrichmentRun } from "@/modules/backstage/projects-enrichment.functions";
import { useQuery } from "@tanstack/react-query";

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

/**
 * Polls an enrichment run and returns the repo currently being processed.
 */
export function useEnrichmentRunProgress(runId: string | null) {
  const query = useQuery({
    queryKey: [queryKeyPrefixes.backstage, "project-enrichment", "run", runId],
    queryFn: () => getProjectEnrichmentRun({ data: { runId: runId ?? "" } }),
    enabled: runId != null,
    refetchInterval: (q) => (q.state.data?.status === "running" ? 2000 : false),
  });

  const targetRepos = parseEnrichmentTargetRepos(query.data?.targetRepos);
  const processedCount = query.data?.processedRepoCount ?? 0;
  const workingRepoFullName =
    query.data?.status === "running" ? (targetRepos[processedCount] ?? null) : null;

  return {
    run: query.data,
    workingRepoFullName,
    isRunning: query.data?.status === "running",
  };
}
