"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { renderProjectCard } from "../../cards/ProjectCard";
import type { GithubRepoNode } from "../../types/github";

type InteractiveProps = {
  pinnedRepos: GithubRepoNode[];
  recentRepos: GithubRepoNode[];
};

function ProjectsStaticFeatured({ repos }: { repos: GithubRepoNode[] }) {
  return (
    <div
      data-test="projects-static-featured"
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {repos.map((repo) => renderProjectCard(repo))}
    </div>
  );
}

/**
 * SSR featured cards, then swap in the search/filter island once the chunk loads.
 * Client Components still SSR their first paint — so the grid is in the HTML.
 */
export function ProjectsSearchIsland({
  pinnedRepos,
  recentRepos,
  featured,
}: InteractiveProps & { featured: GithubRepoNode[] }) {
  const [Interactive] = useState(() =>
    dynamic(
      () =>
        import("./ProjectsInteractive").then((mod) => ({
          default: mod.ProjectsInteractive,
        })),
      {
        ssr: false,
        loading: () => <ProjectsStaticFeatured repos={featured} />,
      },
    ),
  );

  return <Interactive pinnedRepos={pinnedRepos} recentRepos={recentRepos} />;
}
