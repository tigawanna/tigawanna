import { SearchBox } from "@/components/search/SearchBox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { backstageGithubReposCollection } from "@/data-access-layer/backstage/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/backstage-projects-collection";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useTSRSearchQuery } from "@/routes/_backstage/backstage/-hooks/use-tsr-search-query";
import { and, eq, ilike, IR } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { Route, type BackstageProjectsSearch } from "../../projects";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstageProjectRow } from "./BackstageProjectRow";

const projectSortableColumns = createSortableColumns(backstageGithubReposCollection, [
  { value: "nameWithOwner", label: "Repository" },
  { value: "name", label: "Name" },
  { value: "pushedAt", label: "Last pushed" },
  { value: "stargazerCount", label: "Stars" },
  { value: "forkCount", label: "Forks" },
]);

function combineWhereClauses(clauses: Array<IR.BasicExpression<boolean>>) {
  return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
}

export function BackstageProjectsContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams } =
    useTSRSearchQuery<BackstageProjectsSearch>({
      search,
      navigate,
      query_param: "sq",
      debounce_delay: 400,
    });

  const sortBy = search.sortBy ?? "nameWithOwner";
  const sortDirection = search.sortDirection ?? "desc";
  const visibility = search.visibility ?? "all";
  const hasActiveFilters = Boolean(debouncedValue || visibility !== "all");

  const { data: projects } = useLiveSuspenseQuery(
    (q) => {
      let query = q
        .from({ projects: backstageProjectsCollection })
        .leftJoin({ github: backstageGithubReposCollection }, ({ projects, github }) =>
          eq(projects.repoFullName, github.nameWithOwner),
        );

      if (debouncedValue || visibility !== "all") {
        query = query.where(({ projects, github }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [];

          if (debouncedValue) {
            clauses.push(ilike(projects.repoFullName, `%${debouncedValue}%`));
          }

          if (visibility === "private") {
            clauses.push(eq(github.isPrivate, true));
          } else if (visibility === "public") {
            clauses.push(eq(github.isPrivate, false));
          }

          return combineWhereClauses(clauses);
        });
      }

      return query
        .orderBy(({ projects }) => {
          switch (sortBy) {
            case "name":
              return projects.repoFullName;
            case "pushedAt":
              return projects.lastGithubSyncAt;
            case "stargazerCount":
              return projects.attendance;
            case "forkCount":
              return projects.updatedAt;
            default:
              return projects.repoFullName;
          }
        }, sortDirection)
        .select(({ projects, github }) => ({
          project: projects,
          isPrivate: github == null ? null : github.isPrivate,
        }));
    },
    [debouncedValue, sortBy, sortDirection, visibility],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-base-content/60 mt-2 text-sm">
            Repos imported into the database. Import more from{" "}
            <Link to="/backstage/repos" className="link link-hover">
              Repos
            </Link>
            .
          </p>
        </div>
        <Link to="/backstage/repos" className="btn btn-primary btn-sm">
          Import repos
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
          activeFilterCount={visibility !== "all" ? 1 : 0}
          onClear={() => setSearchParams({ visibility: undefined })}
        >
          <BackstageFilterField label="Visibility">
            <Select
              value={visibility}
              onValueChange={(value) =>
                setSearchParams({
                  visibility:
                    value === "all" ? undefined : (value as BackstageProjectsSearch["visibility"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-projects-visibility-filter">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </BackstageFilterField>
          <BackstageFilterField label="Sort">
            <TanstackDBSortSelect
              layout="stacked"
              collection={backstageGithubReposCollection}
              sortableColumns={projectSortableColumns}
              search={search}
              navigate={navigate}
              defaultSortBy="nameWithOwner"
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
                ? "Try a different search term or filter."
                : "Import repos from GitHub to start tracking them here."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/repos" className="btn btn-primary btn-sm">
              Browse GitHub repos
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All projects</CardTitle>
            <CardDescription>
              {projects.length} {hasActiveFilters ? "matching" : ""} repos in the database
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
            {projects.map((row) => (
              <BackstageProjectRow
                key={row.project.githubRepoId}
                project={row.project}
                isPrivate={row.isPrivate ?? null}
              />
            ))}
          </CardContent>
        </Card>
      )}

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
