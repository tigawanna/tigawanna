import { TSRListPagination } from "@/components/pagination/TSRListPagination";
import { SearchBox } from "@/components/search/SearchBox";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { paginateItems } from "@/utils/paginate-items";
import { and, ilike, IR, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { FolderKanban, SearchX } from "lucide-react";
import { Route } from "../../projects";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstageProjectRow } from "./BackstageProjectRow";
import { BackstagePending } from "../shared/BackstagePending";

const ROUTE_ID = "/_backstage/backstage/projects/";

const projectSortableColumns = createSortableColumns(backstageProjectsCollection, [
  { value: "repoFullName", label: "Repository" },
  { value: "lastGithubSyncAt", label: "Last synced" },
  { value: "attendance", label: "Attendance" },
  { value: "updatedAt", label: "Updated" },
  { value: "createdAt", label: "Added" },
]);

/**
 * Combines TanStack DB where clauses with `and`.
 */
function combineWhereClauses(clauses: Array<IR.BasicExpression<boolean>>) {
  return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
}

export function BackstageProjectsContent() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const sortBy = search.sortBy ?? "lastGithubSyncAt";
  const sortDirection = search.sortDirection ?? "desc";
  const page = search.page ?? 1;
  const hasSearch = q.trim().length > 0;

  const { data: projects } = useLiveSuspenseQuery(
    (queryBuilder) => {
      let query = queryBuilder.from({ projects: backstageProjectsCollection });

      if (q) {
        query = query.where(({ projects }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [
            or(
              ilike(projects.repoFullName, `%${q}%`),
              ilike(projects.currentDescription, `%${q}%`),
            ),
          ];
          return combineWhereClauses(clauses);
        });
      }

      return query
        .orderBy(({ projects }) => {
          switch (sortBy) {
            case "attendance":
              return projects.attendance;
            case "updatedAt":
              return projects.updatedAt;
            case "createdAt":
              return projects.createdAt;
            case "lastGithubSyncAt":
              return projects.lastGithubSyncAt;
            default:
              return projects.repoFullName;
          }
        }, sortDirection)
        .select(({ projects }) => projects);
    },
    [q, sortBy, sortDirection],
  );

  const { items: pageProjects, pagination } = paginateItems(
    projects,
    page,
    BACKSTAGE_LIST_PER_PAGE,
  );

  if (projects.length === 0) {
    return (
      <BackstageProjectsListScaffold totalPages={0}>
        {hasSearch ? <ProjectsSearchEmpty query={q.trim()} /> : <ProjectsEmpty />}
      </BackstageProjectsListScaffold>
    );
  }

  return (
    <BackstageProjectsListScaffold totalPages={pagination.totalPages}>
      <div
        className="divide-base-content/10 divide-y rounded-lg border border-base-content/10"
        data-test="backstage-projects-list"
      >
        {pageProjects.map((project) => (
          <BackstageProjectRow key={project.githubRepoId} project={project} />
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        Showing {pageProjects.length} of {pagination.totalItems} {hasSearch ? "matching " : ""}
        {pagination.totalItems === 1 ? "project" : "projects"}
      </p>

      <div className="border-base-content/10 rounded-lg border p-4">
        <h2 className="text-sm font-semibold tracking-tight">Featured ordering</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Drag-and-drop ordering will land here. Pinned repos on the site still come from GitHub
          until this UI ships. The featured_projects table is ready in SQLite — seed rows manually
          until reorder controls are available.
        </p>
      </div>
    </BackstageProjectsListScaffold>
  );
}

function ProjectsEmpty() {
  return (
    <Empty data-test="backstage-projects-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderKanban />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Browse your GitHub repositories and import the ones you want to track here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          to="/backstage/repos"
          className="btn btn-primary btn-sm"
          data-test="projects-empty-browse-repos"
        >
          Browse GitHub repos
        </Link>
      </EmptyContent>
    </Empty>
  );
}

function ProjectsSearchEmpty({ query }: { query: string }) {
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);

  return (
    <Empty data-test="backstage-projects-search-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No projects match “{query}”</EmptyTitle>
        <EmptyDescription>Try a different search term or clear the query.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={clearSearch}
          data-test="backstage-projects-clear-search"
        >
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface BackstageProjectsListScaffoldProps {
  children: React.ReactNode;
  totalPages?: number;
}

function BackstageProjectsListScaffold({
  children,
  totalPages = 0,
}: BackstageProjectsListScaffoldProps) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(ROUTE_ID);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Repos imported into the database. Import more from{" "}
            <Link to="/backstage/repos" className="link link-hover">
              GitHub
            </Link>
            .
          </p>
        </div>
        <Link
          to="/backstage/repos"
          className="btn btn-primary btn-sm"
          data-test="projects-import-link"
        >
          Import from GitHub
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1" data-test="backstage-projects-search">
          <SearchBox
            keyword={inputValue}
            setKeyword={(value) => onSearchChange(value)}
            isDebouncing={isDebouncing}
            inputProps={{
              placeholder: "Search by repository name…",
            }}
          />
        </div>
        <BackstageFiltersDialog
          data-test="backstage-projects-filters"
          activeFilterCount={0}
          onClear={() => undefined}
        >
          <BackstageFilterField label="Sort">
            <TanstackDBSortSelect
              layout="stacked"
              collection={backstageProjectsCollection}
              sortableColumns={projectSortableColumns}
              search={search}
              navigate={navigate}
              defaultSortBy="lastGithubSyncAt"
              defaultSortDirection="desc"
            />
          </BackstageFilterField>
        </BackstageFiltersDialog>
      </div>

      {children}

      <TSRListPagination routeID={ROUTE_ID} totalPages={totalPages} />
    </div>
  );
}

export function BackstageProjectsPending() {
  return (
    <BackstageProjectsListScaffold totalPages={0}>
      <BackstagePending />
    </BackstageProjectsListScaffold>
  );
}
