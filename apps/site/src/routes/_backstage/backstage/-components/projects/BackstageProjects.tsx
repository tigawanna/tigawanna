import { SearchBox } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { and, eq, ilike, IR, isNull, not, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { FolderCodeIcon } from "lucide-react";
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

type JoinedRepoRow = {
  github: BackstageGithubRepo;
  projects: BackstageProject | null;
};

function combineWhereClauses(clauses: Array<IR.BasicExpression<boolean>>) {
  return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
}

export function BackstageProjects() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams } =
    useTSRSearchQuery<BackstageProjectsSearch>({
      search,
      navigate,
      query_param: "sq",
      debounce_delay: 400,
    });

  const sortBy = search.sortBy ?? "pushedAt";
  const sortDirection = search.sortDirection ?? "desc";
  const tracked = search.tracked ?? "all";
  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const hasActiveFilters = Boolean(
    debouncedValue || tracked !== "all" || visibility !== "all" || archived !== "all",
  );

  const { data: rows } = useLiveSuspenseQuery(
    (q) => {
      let query = q
        .from({ github: backstageGithubReposCollection })
        .leftJoin({ projects: backstageProjectsCollection }, ({ github, projects }) =>
          eq(github.nameWithOwner, projects.repoFullName),
        );

      if (debouncedValue || tracked !== "all" || visibility !== "all" || archived !== "all") {
        query = query.where(({ github, projects }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [];

          if (debouncedValue) {
            clauses.push(
              or(
                ilike(github.nameWithOwner, `%${debouncedValue}%`),
                ilike(github.name, `%${debouncedValue}%`),
                ilike(github.description, `%${debouncedValue}%`),
              ),
            );
          }

          if (tracked === "tracked") {
            clauses.push(not(isNull(projects)));
          } else if (tracked === "untracked") {
            clauses.push(isNull(projects));
          }

          if (visibility === "public") {
            clauses.push(eq(github.isPrivate, false));
          } else if (visibility === "private") {
            clauses.push(eq(github.isPrivate, true));
          }

          if (archived === "active") {
            clauses.push(eq(github.isArchived, false));
          } else if (archived === "archived") {
            clauses.push(eq(github.isArchived, true));
          }

          return combineWhereClauses(clauses);
        });
      }

      return query
        .orderBy(({ github }) => {
          switch (sortBy) {
            case "name":
              return github.name;
            case "pushedAt":
              return github.pushedAt;
            case "stargazerCount":
              return github.stargazerCount;
            case "forkCount":
              return github.forkCount;
            default:
              return github.nameWithOwner;
          }
        }, sortDirection)
        .select(({ github, projects }) => ({
          github,
          projects,
        }));
    },
    [debouncedValue, sortBy, sortDirection, tracked, visibility, archived],
  );

  const joinedRows = rows as JoinedRepoRow[];
  const importedCount = joinedRows.filter((row) => row.projects != null).length;

  if (joinedRows.length === 0 && !hasActiveFilters) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCodeIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            No GitHub repos are available yet. Connect GitHub or sync repos to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button variant="outline">Import Project</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          All GitHub repos — import any repo to start tracking it.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1" data-test="backstage-projects-search">
          <SearchBox
            keyword={keyword}
            setKeyword={setKeyword}
            debouncedValue={debouncedValue}
            isDebouncing={isDebouncing}
            inputProps={{
              placeholder: "Search repos…",
            }}
          />
        </div>
        <BackstageFiltersDialog
          data-test="backstage-projects-filters"
          activeFilterCount={
            (tracked !== "all" ? 1 : 0) +
            (visibility !== "all" ? 1 : 0) +
            (archived !== "all" ? 1 : 0)
          }
          onClear={() =>
            setSearchParams({
              tracked: undefined,
              visibility: undefined,
              archived: undefined,
            })
          }
        >
          <BackstageFilterField label="Import status">
            <Select
              value={tracked}
              onValueChange={(value) =>
                setSearchParams({
                  tracked:
                    value === "all" ? undefined : (value as BackstageProjectsSearch["tracked"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-projects-tracked-filter">
                <SelectValue placeholder="Import status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repos</SelectItem>
                <SelectItem value="tracked">Imported</SelectItem>
                <SelectItem value="untracked">Not imported</SelectItem>
              </SelectContent>
            </Select>
          </BackstageFilterField>
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
          <BackstageFilterField label="Status">
            <Select
              value={archived}
              onValueChange={(value) =>
                setSearchParams({
                  archived:
                    value === "all" ? undefined : (value as BackstageProjectsSearch["archived"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-projects-archived-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
              defaultSortBy="pushedAt"
              defaultSortDirection="desc"
            />
          </BackstageFilterField>
        </BackstageFiltersDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All repos</CardTitle>
          <CardDescription>
            {joinedRows.length} {hasActiveFilters ? "matching" : ""}{" "}
            {joinedRows.length === 1 ? "repo" : "repos"} · {importedCount} imported
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
          {joinedRows.length === 0 ? (
            <p className="text-base-content/50 px-4 py-6 text-sm">
              No repos match your search or filters.
            </p>
          ) : (
            joinedRows.map((row) => (
              <BackstageProjectRow
                key={row.github.nameWithOwner}
                github={row.github}
                project={row.projects}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
