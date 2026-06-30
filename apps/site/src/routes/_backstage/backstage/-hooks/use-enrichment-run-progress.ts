import {
  parseEnrichmentTargetRepos,
  projectEnrichmentRunQueryOptions,
} from "@/data-access-layer/backstage/enrichment-run-query-options";
import { useQuery } from "@tanstack/react-query";

/**
 * Polls an enrichment run and returns the repo currently being processed.
 */
export function useEnrichmentRunProgress(runId: string | null) {
  const query = useQuery({
    ...projectEnrichmentRunQueryOptions(runId ?? ""),
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
