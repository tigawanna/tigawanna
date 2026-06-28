import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import {
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/github/query-options";
import type { GithubRepoNode } from "@/types/github";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { renderProjectCard } from "../../cards/ProjectCard";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { filterReposByTopic, matchesProjectSearch } from "./-utils/project-search";
import { orderReposByRelevance } from "@/modules/portfolio/find-relevant-projects";
import { ProjectsSearch } from "./ProjectsSearch";
import { ProjectsTopicFilter, type ProjectView } from "./ProjectsTopicFilter";

const MAX_LANDING_PROJECTS = 6;

function filterValidRepos(repos: (GithubRepoNode | null | undefined)[]) {
  return repos.filter((repo): repo is GithubRepoNode => repo != null);
}

function collectTopics(repos: GithubRepoNode[]) {
  const topics = new Set<string>();
  for (const repo of repos) {
    for (const node of repo?.repositoryTopics?.nodes ?? []) {
      if (node.topic.name) {
        topics.add(node.topic.name);
      }
    }
  }
  return Array.from(topics).sort();
}

function resolvePinnedRepos(nodes: GithubRepoNode[]) {
  return nodes.length > 0 ? nodes : STATIC_PINNED_PROJECTS;
}

function resolveRecentRepos(nodes: GithubRepoNode[]) {
  return nodes.length > 0 ? nodes : STATIC_RECENT_PROJECTS;
}

function ProjectsContent() {
  const [activeView, setActiveView] = useState<ProjectView>("featured");
  const [activeTopic, setActiveTopic] = useState("all");
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const clientOnly = !import.meta.env.SSR;

  const pinnedQuery = useQuery({
    ...pinnedReposQueryOptions,
    enabled: clientOnly,
    placeholderData: () => ({
      data: {
        viewer: {
          pinnedItems: { nodes: STATIC_PINNED_PROJECTS },
          repositories: { nodes: [] },
        },
      },
    }),
  });
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

  const pinnedRepos = resolvePinnedRepos(
    filterValidRepos(pinnedQuery.data?.data?.viewer.pinnedItems.nodes ?? []),
  );
  const recentRepos = resolveRecentRepos(
    filterValidRepos(recentQuery.data?.data?.viewer.repositories.nodes ?? []),
  );
  const topics = collectTopics(recentRepos);

  const isSearching = appliedSearch.length > 0;

  let visibleRepos: GithubRepoNode[] = [];
  if (isSearching) {
    visibleRepos = orderReposByRelevance(
      filterReposByTopic(recentRepos, activeTopic).filter((repo) =>
        matchesProjectSearch(repo, appliedSearch),
      ),
      appliedSearch,
    );
  } else if (activeView === "featured") {
    visibleRepos = pinnedRepos.slice(0, MAX_LANDING_PROJECTS);
  } else if (activeView === "recent") {
    visibleRepos = recentRepos.slice(0, MAX_LANDING_PROJECTS);
  } else {
    visibleRepos = filterReposByTopic(recentRepos, activeTopic).slice(0, MAX_LANDING_PROJECTS);
  }

  const showEmptySearchState = isSearching && visibleRepos.length === 0;

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <ProjectsTopicFilter
          topics={topics}
          activeTopic={activeTopic}
          activeView={activeView}
          onTopicChange={setActiveTopic}
          onViewChange={setActiveView}
        />
        <ProjectsSearch
          value={searchDraft}
          onChange={setSearchDraft}
          onSubmit={() => setAppliedSearch(searchDraft.trim())}
          onClear={() => {
            setSearchDraft("");
            setAppliedSearch("");
          }}
          hasPendingSearch={searchDraft.trim() !== appliedSearch}
        />
      </div>

      {showEmptySearchState ? (
        <p className="text-center text-sm text-landing-sage/50" data-test="projects-search-empty">
          No projects match your search.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleRepos.map((repo) => renderProjectCard(repo))}
        </div>
      )}
    </div>
  );
}

export function LandingProjects() {
  return (
    <LandingSection
      id="projects"
      tone="darkMid"
      className="text-landing-cream"
      dataTest="landing-projects"
    >
      <OrganicDivider tone="darkMid" />
      <OrganicDivider tone="darkMid" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Projects</SectionEyebrow>
          <h2 className="landing-section-heading">Open source projects</h2>
          <p className="landing-section-lead">
            Pinned highlights, recently pushed repos, and topic filters — pulled live from GitHub.
          </p>
        </div>

        <ProjectsContent />
      </div>
    </LandingSection>
  );
}
