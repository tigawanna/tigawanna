"use client";

import { useState } from "react";
import { renderProjectCard } from "../../cards/ProjectCard";
import { orderReposByRelevance } from "../../modules/find-relevant-projects";
import type { GithubRepoNode } from "../../types/github";
import { filterReposByTopic, matchesProjectSearch } from "./-utils/project-search";
import { ProjectsSearch } from "./ProjectsSearch";
import { ProjectsTopicFilter, type ProjectView } from "./ProjectsTopicFilter";

const MAX_LANDING_PROJECTS = 6;

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

/**
 * Interactive projects island — filters, search, and the resulting card grid.
 */
export function ProjectsInteractive({
  pinnedRepos,
  recentRepos,
}: {
  pinnedRepos: GithubRepoNode[];
  recentRepos: GithubRepoNode[];
}) {
  const [activeView, setActiveView] = useState<ProjectView>("featured");
  const [activeTopic, setActiveTopic] = useState("all");
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

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
