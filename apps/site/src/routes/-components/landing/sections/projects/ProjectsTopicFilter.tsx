type ProjectView = "featured" | "recent" | "all";

export function ProjectsTopicFilter({
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
            className={isActive ? "landing-filter-pill-active" : "landing-filter-pill-inactive"}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export type { ProjectView };
