import { ListPagination } from "@/components/pagination/ReactresponsivePagination";
import { SearchBox } from "@/components/search/SearchBox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import { useTSRSearchQuery } from "@/hooks/use-tsr-search-query";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { paginateItems } from "@/utils/paginate-items";
import { and, ilike, IR, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { useTransition } from "react";
import { Route, type BackstageProjectsSearch } from "../../projects";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstageProjectRow } from "./BackstageProjectRow";

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
  const navigate = Route.useNavigate();
  const [, startTransition] = useTransition();
  const { debouncedValue, isDebouncing, keyword, setKeyword } =
    useTSRSearchQuery<BackstageProjectsSearch>({
      search,
      navigate,
      query_param: "sq",
      debounce_delay: 400,
    });

  const sortBy = search.sortBy ?? "lastGithubSyncAt";
  const sortDirection = search.sortDirection ?? "desc";
  const page = search.page ?? 1;
  const hasActiveFilters = Boolean(debouncedValue);

  const { data: projects } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ projects: backstageProjectsCollection });

      if (debouncedValue) {
        query = query.where(({ projects }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [
            or(
              ilike(projects.repoFullName, `%${debouncedValue}%`),
              ilike(projects.currentDescription, `%${debouncedValue}%`),
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
    [debouncedValue, sortBy, sortDirection],
  );

  const { items: pageProjects, pagination } = paginateItems(
    projects,
    page,
    BACKSTAGE_LIST_PER_PAGE,
  );

  const setPage = (nextPage: number) => {
    startTransition(() => {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: nextPage <= 1 ? undefined : nextPage,
        }),
        replace: true,
        viewTransition: false,
      });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-base-content/60 mt-2 text-sm">
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
            keyword={keyword}
            setKeyword={setKeyword}
            debouncedValue={debouncedValue}
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

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{hasActiveFilters ? "No matching projects" : "No projects yet"}</CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? "Try a different search term."
                : "Browse your GitHub repositories and import the ones you want to track here."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/backstage/repos"
              className="btn btn-primary btn-sm"
              data-test="projects-empty-browse-repos"
            >
              Browse GitHub repos
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All projects</CardTitle>
            <CardDescription>
              Showing {pageProjects.length} of {pagination.totalItems}{" "}
              {hasActiveFilters ? "matching " : ""}
              {pagination.totalItems === 1 ? "project" : "projects"}
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
            {pageProjects.map((project) => (
              <BackstageProjectRow key={project.githubRepoId} project={project} />
            ))}
          </CardContent>
        </Card>
      )}

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        data-test="backstage-projects-pagination"
      />

      <Card>
        <CardHeader>
          <CardTitle>Featured ordering</CardTitle>
          <CardDescription>
            Drag-and-drop ordering will land here. Pinned repos on the site still come from GitHub
            until this UI ships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base-content/60 text-sm">
            The featured_projects table is ready in SQLite. Seed rows manually until reorder
            controls are available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
