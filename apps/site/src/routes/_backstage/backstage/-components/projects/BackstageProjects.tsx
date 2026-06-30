import { SearchBox } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/button";
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
import { nullableBackstageProject } from "@/data-access-layer/backstage/backstage-project-mapper";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/backstage-projects-collection";
import {
  importBackstageProject,
  bulkImportBackstageProjects,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useTSRSearchQuery } from "@/routes/_backstage/backstage/-hooks/use-tsr-search-query";
import type {
  BulkImportProjectOptions,
  ImportProjectOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { unwrapUnknownError } from "@/utils/errors";
import { and, eq, ilike, IR, isNull, not, or } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Download, FolderCodeIcon, Loader, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Route, type BackstageProjectsSearch } from "../../projects";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstageProjectRow } from "./BackstageProjectRow";
import { BulkImportDialog } from "./BulkImportDialog";

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

export function BackstageProjects() {
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (options: ImportProjectOptions) => {
      const tx = importBackstageProject(options);
      await tx.isPersisted.promise;
    },
    onMutate: (options) => {
      setImportingRepo(options.repoFullName);
    },
    onSettled: () => {
      setImportingRepo(null);
    },
    onSuccess(_data, options) {
      toast.success("Imported to projects", { description: options.repoFullName });
    },
    onError(err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (options: BulkImportProjectOptions) => bulkImportBackstageProjects(options),
    onSuccess(result) {
      toast.success(`Imported ${result.importedCount} repos`, {
        description: result.runId ? "Workflow started" : "Import only",
      });
    },
    onError(err: unknown) {
      toast.error("Bulk import failed", { description: unwrapUnknownError(err).message });
    },
  });

  const isImportBusy = importingRepo != null || bulkImportMutation.isPending;

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
  const archived = search.archived ?? "all";

  const { data: rows, isLoading } = useLiveQuery(
    (q) => {
      let query = q
        .from({ github: backstageGithubReposCollection })
        .leftJoin({ projects: backstageProjectsCollection }, ({ github, projects }) =>
          eq(github.nameWithOwner, projects.repoFullName),
        )
        .where(({ github, projects }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [eq(github.isPrivate, false)];

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

          if (archived === "active") {
            clauses.push(eq(github.isArchived, false));
          } else if (archived === "archived") {
            clauses.push(eq(github.isArchived, true));
          }

          return combineWhereClauses(clauses);
        });

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
    [debouncedValue, sortBy, sortDirection, tracked, archived],
  );

  const joinedRows = rows.map((row) => ({
    github: row.github,
    projects: nullableBackstageProject(row.projects),
  }));

  const untrackedRepoFullNames = joinedRows
    .filter((row) => row.projects == null)
    .map((row) => row.github.nameWithOwner);

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 max-h-screen"
      data-test="backstage-projects"
    >
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        repoFullNames={untrackedRepoFullNames}
        isImporting={bulkImportMutation.isPending}
        onConfirm={(options) => bulkImportMutation.mutate(options)}
      />
      <div className="w-full sticky top-0 z-20 p-1 rounded">
        <div className="flex flex-wrap items-start justify-between gap-4 w-full">
          <h1 className="text-2xl font-semibold tracking-tight md:flex-1">Projects</h1>
          <div className="md:flex-2 flex items-center gap-2 w-full">
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
              activeFilterCount={(tracked !== "all" ? 1 : 0) + (archived !== "all" ? 1 : 0)}
              onClear={() =>
                setSearchParams({
                  tracked: undefined,
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
              <BackstageFilterField label="Status">
                <Select
                  value={archived}
                  onValueChange={(value) =>
                    setSearchParams({
                      archived:
                        value === "all"
                          ? undefined
                          : (value as BackstageProjectsSearch["archived"]),
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
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 w-full">
          <p className="text-base-content/60 mt-2 text-sm">
            Public GitHub repos only — import any repo to start tracking it on the site.
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              data-test="bulk-import-open"
              title="Import all untracked"
              aria-label="Import all untracked repos"
              disabled={isImportBusy || untrackedRepoFullNames.length === 0}
              onClick={() => setBulkImportOpen(true)}
            >
              <Download className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => backstageGithubReposCollection.utils.refetch()}
              disabled={isLoading}
            >
              <RefreshCcwIcon
                data-loading={isLoading}
                className="size-4 data-[loading=true]:animate-spin"
              />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="size-4 animate-spin" />
          </div>
        ) : null}
        {!isLoading && (!joinedRows || joinedRows.length === 0) ? (
          <div className="flex items-center justify-center h-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCodeIcon />
                </EmptyMedia>
                <EmptyTitle>No Projects Yet</EmptyTitle>
                <EmptyDescription>
                  No projects found. Import a project to get started
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
                  Import all
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSearchParams({
                      tracked: undefined,
                      archived: undefined,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : null}
        {joinedRows.length > 0 &&
          joinedRows.map((row) => (
            <BackstageProjectRow
              key={row.github.nameWithOwner}
              github={row.github}
              project={row.projects}
              onRequestImport={(options) => importMutation.mutate(options)}
              isImporting={importingRepo === row.github.nameWithOwner}
              importDisabled={isImportBusy}
            />
          ))}
      </div>
    </div>
  );
}
