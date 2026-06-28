import { STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import { recentReposQueryOptions } from "@/data-access-layer/github/query-options";
import { useWebMcpLandingTools } from "@/hooks/use-webmcp-landing-tools";
import type { GithubRepoNode } from "@/types/github";
import { useQuery } from "@tanstack/react-query";

function filterValidRepos(repos: (GithubRepoNode | null | undefined)[]) {
  return repos.filter((repo): repo is GithubRepoNode => repo != null);
}

function resolveRecentRepos(nodes: GithubRepoNode[]) {
  return nodes.length > 0 ? nodes : STATIC_RECENT_PROJECTS;
}

export function LandingWebMcpTools() {
  const clientOnly = !import.meta.env.SSR;

  const recentQuery = useQuery({
    ...recentReposQueryOptions,
    enabled: clientOnly,
    placeholderData: () => ({
      data: {
        viewer: {
          pinnedItems: { nodes: [] },
          repositories: { nodes: STATIC_RECENT_PROJECTS },
        },
      },
      errors: [],
    }),
  });

  const projectCatalog = resolveRecentRepos(
    filterValidRepos(recentQuery.data?.data?.viewer.repositories.nodes ?? []),
  );

  useWebMcpLandingTools(() => projectCatalog);

  return null;
}
