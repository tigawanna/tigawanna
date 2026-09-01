import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listGithubReposForBackstage } from "@/modules/backstage/github-repos.functions";
import {
  getBackstageProjectDetail,
  listProjectRepos,
} from "@/modules/backstage/projects.functions";
import { queryOptions } from "@tanstack/react-query";

type BackstageInvalidateKey = [typeof queryKeyPrefixes.backstage, ...(readonly unknown[])];

export const backstageRepoMutationInvalidates: BackstageInvalidateKey[] = [
  [queryKeyPrefixes.backstage, "github-repos"],
  [queryKeyPrefixes.backstage, "projects"],
  [queryKeyPrefixes.backstage, "project-enrichment"],
  [queryKeyPrefixes.backstage, "dashboard-counts"],
];

export const backstageProjectsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "projects"],
  queryFn: () => listProjectRepos({ data: { page: 1, perPage: 500 } }),
});

export const backstageGithubReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.backstage, "github-repos"],
  queryFn: () => listGithubReposForBackstage(),
});

export function backstageProjectDetailQueryOptions(repoFullName: string) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.backstage, "projects", "detail", repoFullName],
    queryFn: () => getBackstageProjectDetail({ data: { repoFullName } }),
  });
}
