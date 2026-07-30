"use client";

import { twMerge } from "tailwind-merge";
import {
  REPOSITORY_CATEGORIES,
  type RepositoryCategory,
} from "@/modules/github/repository-category";

type ProjectView = "featured" | "recent" | "all";

export function ProjectsTopicFilter({
  topics,
  categories,
  activeTopic,
  activeCategory,
  activeView,
  onTopicChange,
  onCategoryChange,
  onViewChange,
}: {
  topics: string[];
  categories: RepositoryCategory[];
  activeTopic: string;
  activeCategory: string;
  activeView: ProjectView;
  onTopicChange: (topic: string) => void;
  onCategoryChange: (category: string) => void;
  onViewChange: (view: ProjectView) => void;
}) {
  const viewPills: { id: ProjectView; label: string }[] = [
    { id: "featured", label: "Featured" },
    { id: "recent", label: "Recent" },
    { id: "all", label: "All" },
  ];

  const categoryOptions = REPOSITORY_CATEGORIES.filter((entry) => categories.includes(entry.value));

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3"
      data-test="projects-topic-filter"
    >
      <div className="flex flex-wrap gap-2">
        {viewPills.map(({ id, label }) => {
          const isActive =
            id === "all"
              ? activeView === "all" && activeTopic === "all" && activeCategory === "all"
              : activeView === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onViewChange(id);
                if (id === "all") {
                  onTopicChange("all");
                  onCategoryChange("all");
                }
              }}
              className={isActive ? "landing-filter-pill-active" : "landing-filter-pill-inactive"}
            >
              {label}
            </button>
          );
        })}
      </div>

      {categoryOptions.length > 0 ? (
        <select
          aria-label="Filter projects by category"
          data-test="projects-category-select"
          value={activeView === "all" ? activeCategory : "all"}
          onChange={(event) => {
            onViewChange("all");
            onCategoryChange(event.target.value);
          }}
          className={twMerge(
            "min-w-40 rounded-full border border-landing-cream/10 bg-transparent px-3 py-2 text-sm text-landing-sage/80 shadow-none outline-none",
            "hover:border-landing-cream/20 hover:bg-landing-cream/5 hover:text-landing-sage",
            activeView === "all" &&
              activeCategory !== "all" &&
              "border-landing-cream/25 bg-landing-cream/10 text-landing-cream",
          )}
        >
          <option value="all">All categories</option>
          {categoryOptions.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      ) : null}

      {topics.length > 0 ? (
        <select
          aria-label="Filter projects by tag"
          data-test="projects-tag-select"
          value={activeView === "all" ? activeTopic : "all"}
          onChange={(event) => {
            onViewChange("all");
            onTopicChange(event.target.value);
          }}
          className={twMerge(
            "min-w-44 rounded-full border border-landing-cream/10 bg-transparent px-3 py-2 text-sm text-landing-sage/80 shadow-none outline-none",
            "hover:border-landing-cream/20 hover:bg-landing-cream/5 hover:text-landing-sage",
            activeView === "all" &&
              activeTopic !== "all" &&
              "border-landing-cream/25 bg-landing-cream/10 text-landing-cream",
          )}
        >
          <option value="all">All tags</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

export type { ProjectView };
