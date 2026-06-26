import { getPinnedRepos, getRecentRepos } from "@/lib/github/repos";
import { queryOptions } from "@tanstack/react-query";

export const pinnedReposQueryOptions = queryOptions({
  queryKey: ["github", "repos", "pinned"],
  queryFn: () => getPinnedRepos(),
});

export const recentReposQueryOptions = queryOptions({
  queryKey: ["github", "repos", "recent"],
  queryFn: () => getRecentRepos(),
});
