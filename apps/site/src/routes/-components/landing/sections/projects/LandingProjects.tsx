import { CreatureEggLowercaseI } from "@/components/creature-egg/CreatureEggTrigger";
import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import {
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/github/query-options";
import type { GithubRepoNode } from "@/types/github";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { renderProjectCard } from "../../cards/ProjectCard";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { ProjectsTopicFilter, type ProjectView } from "./ProjectsTopicFilter";

function collectTopics(repos: GithubRepoNode[]) {
  const topics = new Set<string>();
  for (const repo of repos) {
    for (const node of repo.repositoryTopics?.nodes ?? []) {
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

  const { data: pinnedResponse } = useSuspenseQuery(pinnedReposQueryOptions);
  const { data: recentResponse } = useSuspenseQuery(recentReposQueryOptions);

  const pinnedRepos = resolvePinnedRepos(pinnedResponse?.data?.viewer.pinnedItems.nodes ?? []);
  const recentRepos = resolveRecentRepos(recentResponse.data?.viewer.repositories.nodes ?? []);
  const topics = collectTopics(recentRepos);

  let visibleRepos: GithubRepoNode[] = [];
  if (activeView === "featured") {
    visibleRepos = pinnedRepos;
  } else if (activeView === "recent") {
    visibleRepos = recentRepos.slice(0, 6);
  } else {
    visibleRepos = recentRepos
      .filter((repo) => {
        if (activeTopic === "all") return true;
        return repo.repositoryTopics?.nodes?.some(
          (topic) => topic.topic.name.toLowerCase() === activeTopic.toLowerCase(),
        );
      })
      .slice(0, 6);
  }

  return (
    <div className="space-y-10">
      <ProjectsTopicFilter
        topics={topics}
        activeTopic={activeTopic}
        activeView={activeView}
        onTopicChange={setActiveTopic}
        onViewChange={setActiveView}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleRepos.map((repo) => renderProjectCard(repo))}
      </div>

      {activeView === "recent" && recentRepos.length > 6 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recentRepos.slice(6, 12).map((repo) => renderProjectCard(repo))}
        </div>
      ) : null}
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
          <h2 className="landing-section-heading">
            Th
            <CreatureEggLowercaseI />
            ngs I&apos;ve built.
          </h2>
          <p className="landing-section-lead">
            Pinned highlights, recently pushed repos, and topic filters — pulled live from GitHub.
          </p>
        </div>

        <Suspense fallback={<PortfolioGridSkeleton count={6} />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </LandingSection>
  );
}
