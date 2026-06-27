import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  listProjectEnrichmentRuns,
  listProjectEnrichmentSuggestions,
  listProjectRepos,
} from "@/modules/backstage/projects-enrichment.functions";
import { queryOptions } from "@tanstack/react-query";

export const projectEnrichmentSuggestionsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "project-enrichment", "suggestions"],
  queryFn: () => listProjectEnrichmentSuggestions(),
});

export const projectReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "project-enrichment", "repos"],
  queryFn: () => listProjectRepos(),
});

export const projectEnrichmentRunsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "project-enrichment", "runs"],
  queryFn: () => listProjectEnrichmentRuns(),
});
