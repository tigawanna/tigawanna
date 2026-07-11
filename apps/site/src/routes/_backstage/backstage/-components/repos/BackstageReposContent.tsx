import { SearchBox } from "@/components/search/SearchBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import {
  bulkImportBackstageProjects,
  importBackstageProject,
} from "@/data-access-layer/backstage/projects/backstage-collection-mutations";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { backstageGithubReposQueryOptions } from "@/data-access-layer/backstage/projects/projects-query-options";
import { useTSRSearchQuery } from "@/hooks/use-tsr-search-query";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useEnrichmentRunProgress } from "@/routes/_backstage/backstage/-hooks/use-enrichment-run-progress";
import type {
  BulkImportProjectOptions,
  ImportProjectOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { unwrapUnknownError } from "@/utils/errors";
import { and, eq, ilike, IR, isNull, not, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { Route, type BackstageReposSearch } from "../../repos";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstageRepoRow } from "./BackstageRepoRow";
import { BulkImportDialog } from "./BulkImportDialog";

const repoSortableColumns = createSortableColumns(backstageGithubReposCollection, [
  { value: "nameWithOwner", label: "Repository" },
  { value: "name", label: "Name" },
  { value: "pushedAt", label: "Last pushed" },
  { value: "stargazerCount", label: "Stars" },
  { value: "forkCount", label: "Forks" },
]);

/**
 * Combines TanStack DB where clauses with `and`.
 */
function combineWhereClauses(clauses: Array<IR.BasicExpression<boolean>>) {
  return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
}

export function BackstageReposContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams } =
    useTSRSearchQuery<BackstageReposSearch>({
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

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const { workingRepoFullName, isRunning } = useEnrichmentRunProgress(activeRunId);

  useEffect(() => {
    if (activeRunId && !isRunning) {
      setActiveRunId(null);
      void backstageProjectsCollection.utils.refetch();
    }
  }, [activeRunId, isRunning]);

  useEffect(() => {
    if (!activeRunId || !isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void backstageProjectsCollection.utils.refetch();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [activeRunId, isRunning]);

  const { data: repoRows } = useLiveSuspenseQuery(
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
          repo: github,
          isTracked: projects != null,
        }));
    },
    [debouncedValue, sortBy, sortDirection, tracked, visibility, archived],
  );

  const { data: githubErrors = [], isFetching: isRefetchingRepos } = useQuery({
    ...backstageGithubReposQueryOptions,
    select: (data) => data.errors,
  });

  const importMutation = useMutation({
    mutationFn: (options: ImportProjectOptions) => importBackstageProject(options),
    onMutate: (options) => {
      setImportingRepo(options.repoFullName);
    },
    onSettled: () => {
      setImportingRepo(null);
    },
    onSuccess(result, options) {
      toast.success("Imported to projects", { description: options.repoFullName });
      if (result.runId) {
        setActiveRunId(result.runId);
      }
    },
    onError(err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (options: BulkImportProjectOptions) => bulkImportBackstageProjects(options),
    onSuccess(result) {
      toast.success(`Imported ${result.importedCount} repos`, {
        description: result.runId ? "Workflow running…" : "Import only",
      });
      if (result.runId) {
        setActiveRunId(result.runId);
      }
    },
    onError(err: unknown) {
      toast.error("Bulk import failed", { description: unwrapUnknownError(err).message });
    },
  });

  const untrackedRepoFullNames = repoRows
    .filter((row) => !row.isTracked)
    .map((row) => row.repo.nameWithOwner);

  const trackedCount = repoRows.filter((row) => row.isTracked).length;
  const isImportBusy = importingRepo != null || bulkImportMutation.isPending || activeRunId != null;

  const isRowWorking = (repoFullName: string) =>
    importingRepo === repoFullName ||
    workingRepoFullName === repoFullName ||
    (bulkImportMutation.isPending && untrackedRepoFullNames.includes(repoFullName));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-repos">
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        repoFullNames={untrackedRepoFullNames}
        isImporting={bulkImportMutation.isPending}
        onConfirm={(options) => bulkImportMutation.mutate(options)}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FaGithub className="size-6" aria-hidden />
            <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          </div>
          <p className="text-base-content/60 mt-2 text-sm">
            Your 100 most recently pushed repos. Import into projects, change visibility, or delete
            on GitHub.
          </p>
        </div>
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
            data-test="repos-refetch"
            aria-label="Refresh GitHub repos"
            onClick={() => backstageGithubReposCollection.utils.refetch()}
            disabled={isRefetchingRepos}
          >
            <RefreshCcwIcon
              data-loading={isRefetchingRepos}
              className="size-4 data-[loading=true]:animate-spin"
            />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1" data-test="backstage-repos-search">
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
          data-test="backstage-repos-filters"
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
          <BackstageFilterField label="Tracking">
            <Select
              value={tracked}
              onValueChange={(value) =>
                setSearchParams({
                  tracked: value === "all" ? undefined : (value as BackstageReposSearch["tracked"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-repos-tracked-filter">
                <SelectValue placeholder="Tracking" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repos</SelectItem>
                <SelectItem value="tracked">In projects</SelectItem>
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
                    value === "all" ? undefined : (value as BackstageReposSearch["visibility"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-repos-visibility-filter">
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
                    value === "all" ? undefined : (value as BackstageReposSearch["archived"]),
                })
              }
            >
              <SelectTrigger className="w-full" data-test="backstage-repos-archived-filter">
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
              sortableColumns={repoSortableColumns}
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
          <CardTitle className="flex items-center gap-2">
            <FaGithub className="size-4" aria-hidden />
            Repositories
          </CardTitle>
          <CardDescription>
            {repoRows.length} {hasActiveFilters ? "matching" : ""} repos · {trackedCount} already in
            projects · {untrackedRepoFullNames.length} not imported
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
          {repoRows.length === 0 ? (
            <p className="text-base-content/50 px-4 py-6 text-sm">
              {hasActiveFilters
                ? "No repos match your search or filters."
                : githubErrors.length > 0
                  ? "No accessible repos returned. Org-restricted repos are skipped when your PAT exceeds the org token lifetime policy."
                  : "No repos found."}
            </p>
          ) : (
            repoRows.map((row) => (
              <BackstageRepoRow
                key={row.repo.id}
                repo={row.repo}
                isTracked={row.isTracked}
                isImporting={isRowWorking(row.repo.nameWithOwner)}
                onImport={(options) => importMutation.mutate(options)}
                disabled={isImportBusy}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
