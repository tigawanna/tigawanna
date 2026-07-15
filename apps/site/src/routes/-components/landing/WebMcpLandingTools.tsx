import { recentReposQueryOptions } from "@/data-access-layer/portfolio/landng-page-query-options";
import { useWebMcpLandingTools } from "@/hooks/use-webmcp-landing-tools";
import type { GithubRepoNode } from "@/types/github";
import { useQuery } from "@tanstack/react-query";

function filterValidRepos(repos: (GithubRepoNode | null | undefined)[]) {
  return repos.filter((repo): repo is GithubRepoNode => repo != null);
}

export function LandingWebMcpTools() {
  const recentQuery = useQuery(recentReposQueryOptions);

  const projectCatalog = filterValidRepos(recentQuery.data?.data?.viewer.repositories.nodes ?? []);

  useWebMcpLandingTools(() => projectCatalog);

  return null;
}
