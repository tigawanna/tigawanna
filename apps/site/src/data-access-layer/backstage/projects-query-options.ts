import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listGithubReposForBackstage } from "@/lib/backstage/projects.functions";
import { listProjectRepos } from "@/lib/backstage/projects-enrichment.functions";
import { queryOptions } from "@tanstack/react-query";

type BackstageInvalidateKey = [typeof queryKeyPrefixes.backstage, ...(readonly unknown[])];

export const backstageRepoMutationInvalidates: BackstageInvalidateKey[] = [
  [queryKeyPrefixes.backstage, "github-repos"],
  [queryKeyPrefixes.backstage, "projects"],
  [queryKeyPrefixes.backstage, "project-enrichment"],
];

export const backstageProjectsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "projects"],
  queryFn: () => listProjectRepos(),
});

export const backstageGithubReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "github-repos"],
  queryFn: () => listGithubReposForBackstage(),
});
