import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listGithubReposForBackstage } from "@/lib/backstage/projects.functions";
import { listProjectRepos } from "@/lib/backstage/projects-enrichment.functions";
import { queryOptions } from "@tanstack/react-query";

export const backstageProjectsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "projects"],
  queryFn: () => listProjectRepos(),
});

export const backstageGithubReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "github-repos"],
  queryFn: () => listGithubReposForBackstage(),
});
