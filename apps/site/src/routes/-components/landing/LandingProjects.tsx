import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import { CreatureEggLowercaseI } from "@/components/creature-egg/CreatureEggTrigger";
import type { GithubRepoNode } from "@/types/github";
import { useState } from "react";
import { LandingSection, OrganicDivider, SectionEyebrow } from "./LandingPrimitives";
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
                ? "rounded-full border border-[#f6efd7]/25 bg-[#f6efd7]/15 px-4 py-2 text-sm text-[#f6efd7]"
                : "rounded-full border border-[#f6efd7]/10 bg-transparent px-4 py-2 text-sm text-[#c5ccb4]/60 transition-colors hover:border-[#f6efd7]/20 hover:text-[#c5ccb4]"
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

  const pinnedRepos = STATIC_PINNED_PROJECTS;
  const recentRepos = STATIC_RECENT_PROJECTS;
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
      className="text-[#f6efd7]"
      dataTest="landing-projects"
    >
      <OrganicDivider tone="darkMid" />
      <OrganicDivider tone="darkMid" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Projects</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Th
            <CreatureEggLowercaseI />
            ngs I&apos;ve built.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#c5ccb4]/70">
            Pinned highlights, recently pushed repos, and topic filters — curated shelves until the
            admin flow lands.
          </p>
        </div>

        <ProjectsContent />
      </div>
    </LandingSection>
  );
}
