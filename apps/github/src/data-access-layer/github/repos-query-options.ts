import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getPinnedRepos, getRecentRepos } from "@/modules/github/repos";
import { queryOptions } from "@tanstack/react-query";

export const pinnedReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "pinned"],
  queryFn: () => getPinnedRepos(),
});

export const recentReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "recent"],
  queryFn: () => getRecentRepos(),
});
