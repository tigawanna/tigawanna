import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getPinnedRepos, getRecentRepos } from "@/modules/github/repos";
import { queryOptions } from "@tanstack/react-query";

export const pinnedReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "pinned"],
  queryFn: () => getPinnedRepos(),
});

export const recentReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "recent"],
  queryFn: () => getRecentRepos(),
});
