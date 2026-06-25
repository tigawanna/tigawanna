import {
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/portfolio/query-options";
import type { GithubRepoNode } from "@/types/github";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { PortfolioGridSkeleton } from "./PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";
import { renderProjectCard } from "./ProjectCard";

type ProjectView = "featured" | "recent" | "all";

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

function ProjectsTopicFilter({
  topics,
  activeTopic,
  activeView,
  onTopicChange,
  onViewChange,
}: {
  topics: string[];
  activeTopic: string;
  activeView: ProjectView;
  onTopicChange: (topic: string) => void;
  onViewChange: (view: ProjectView) => void;
}) {
  const filters = ["featured", "recent", "all", ...topics] as const;

  return (
    <div className="flex flex-wrap gap-2" data-test="projects-topic-filter">
      {filters.map((item) => {
        const isActive =
          item === "featured"
            ? activeView === "featured"
            : item === "recent"
              ? activeView === "recent"
              : item === "all"
                ? activeView === "all" && activeTopic === "all"
                : activeView === "all" && activeTopic === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              if (item === "featured") {
                onViewChange("featured");
                return;
              }
              if (item === "recent") {
                onViewChange("recent");
                return;
              }
              onViewChange("all");
              onTopicChange(item);
            }}
            className={
              isActive
                ? "rounded-full border border-[#1b1d14]/20 bg-[#1b1d14] px-4 py-2 text-sm text-[#f6efd7]"
                : "rounded-full border border-[#1b1d14]/15 bg-[#1b1d14]/5 px-4 py-2 text-sm text-[#1b1d14]/70 transition-colors hover:border-[#1b1d14]/30"
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function ProjectsContent() {
  const [activeView, setActiveView] = useState<ProjectView>("featured");
  const [activeTopic, setActiveTopic] = useState("all");

  const { data: pinned } = useSuspenseQuery(pinnedReposQueryOptions);
  const { data: recentResult } = useSuspenseQuery(recentReposQueryOptions);

  const recentRepos = recentResult?.data?.viewer?.repositories?.nodes ?? [];
  const pinnedRepos =
    pinned && "data" in pinned && pinned.data?.viewer?.pinnedItems?.nodes
      ? pinned.data.viewer.pinnedItems.nodes
      : [];

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

      {visibleRepos.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRepos.map((repo) => renderProjectCard(repo))}
        </div>
      ) : (
        <p className="rounded-[2rem] border border-[#1b1d14]/10 bg-[#f6efd7]/60 p-8 text-center text-[#1b1d14]/70">
          No projects to show yet. Configure GH_PAT to load GitHub repositories.
        </p>
      )}

      {activeView === "recent" && recentRepos.length > 6 ? (
        <ScrollReveal delay="short">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentRepos.slice(6, 12).map((repo) => renderProjectCard(repo))}
          </div>
        </ScrollReveal>
      ) : null}
    </div>
  );
}

export function LandingProjects() {
  return (
    <LandingSection
      id="projects"
      tone="cream"
      className="text-[#1b1d14]"
      dataTest="landing-projects"
    >
      <OrganicDivider tone="cream" />
      <OrganicDivider tone="cream" flip />

      <div className="container relative z-10">
        <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Projects</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Shipped work, active experiments, and open source.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#1b1d14]/70">
            Pinned highlights, recently pushed repos, and topic filters pulled straight from GitHub.
          </p>
        </ScrollReveal>

        <Suspense fallback={<PortfolioGridSkeleton count={6} />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </LandingSection>
  );
}
