import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getPinnedRepos, getRecentRepos } from "@/modules/github/repos";
import { queryOptions } from "@tanstack/react-query";

/** Align client refetch with Vercel CDN TTL on the GitHub server functions. */
const GITHUB_REPOS_STALE_TIME_MS = 60 * 60 * 1000;

export const pinnedReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "pinned"],
  queryFn: () => getPinnedRepos(),
  staleTime: GITHUB_REPOS_STALE_TIME_MS,
});

export const recentReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "recent"],
  queryFn: () => getRecentRepos(),
  staleTime: GITHUB_REPOS_STALE_TIME_MS,
});
