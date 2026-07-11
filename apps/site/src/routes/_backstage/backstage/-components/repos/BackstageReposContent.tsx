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
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useEnrichmentRunProgress } from "@/routes/_backstage/backstage/-hooks/use-enrichment-run-progress";
import type {
  BulkImportProjectOptions,
  ImportProjectOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { unwrapUnknownError } from "@/utils/errors";
import { paginateItems } from "@/utils/paginate-items";
import { and, eq, ilike, IR, isNull, not, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, RefreshCcwIcon, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { Route, type BackstageReposSearch } from "../../repos";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { BackstagePending } from "../shared/BackstagePending";
import { BackstageRepoRow } from "./BackstageRepoRow";
import { BulkImportDialog } from "./BulkImportDialog";

const ROUTE_ID = "/_backstage/backstage/repos";

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

/**
 * While an enrichment run is active, periodically refetch projects; clear the run id when done.
 */
function useEnrichmentProjectsSync(
  activeRunId: string | null,
  setActiveRunId: (runId: string | null) => void,
) {
  const { workingRepoFullName, run } = useEnrichmentRunProgress(activeRunId);

  useEffect(() => {
    if (!activeRunId || !run) return;

    if (run.status !== "running") {
      setActiveRunId(null);
      void backstageProjectsCollection.utils.refetch();
      return;
    }

    const intervalId = window.setInterval(() => {
      void backstageProjectsCollection.utils.refetch();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [activeRunId, run, setActiveRunId]);

  return { workingRepoFullName };
}

export function BackstageReposContent() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const sortBy = search.sortBy ?? "pushedAt";
  const sortDirection = search.sortDirection ?? "desc";
  const tracked = search.tracked ?? "all";
  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const page = search.page ?? 1;
  const hasActiveFilters = Boolean(
    q || tracked !== "all" || visibility !== "all" || archived !== "all",
  );

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const { workingRepoFullName } = useEnrichmentProjectsSync(activeRunId, setActiveRunId);

  const { data: repoRows } = useLiveSuspenseQuery(
    (queryBuilder) => {
      let query = queryBuilder
        .from({ github: backstageGithubReposCollection })
        .leftJoin({ projects: backstageProjectsCollection }, ({ github, projects }) =>
          eq(github.nameWithOwner, projects.repoFullName),
        );

      if (q || tracked !== "all" || visibility !== "all" || archived !== "all") {
        query = query.where(({ github, projects }) => {
          const clauses: Array<IR.BasicExpression<boolean>> = [];

          if (q) {
            clauses.push(
              or(
                ilike(github.nameWithOwner, `%${q}%`),
                ilike(github.name, `%${q}%`),
                ilike(github.description, `%${q}%`),
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
    [q, sortBy, sortDirection, tracked, visibility, archived],
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

  const { items: pageRepoRows, pagination } = paginateItems(
    repoRows,
    page,
    BACKSTAGE_LIST_PER_PAGE,
  );

  const isRowWorking = (repoFullName: string) =>
    importingRepo === repoFullName ||
    workingRepoFullName === repoFullName ||
    (bulkImportMutation.isPending && untrackedRepoFullNames.includes(repoFullName));

  if (repoRows.length === 0) {
    return (
      <BackstageReposListScaffold
        totalPages={0}
        bulkImportOpen={bulkImportOpen}
        onBulkImportOpenChange={setBulkImportOpen}
        untrackedRepoFullNames={untrackedRepoFullNames}
        isBulkImporting={bulkImportMutation.isPending}
        onBulkImportConfirm={(options) => bulkImportMutation.mutate(options)}
        isImportBusy={isImportBusy}
        isRefetchingRepos={isRefetchingRepos}
      >
        <ReposEmpty
          hasActiveFilters={hasActiveFilters}
          hasGithubErrors={githubErrors.length > 0}
          query={q.trim()}
        />
      </BackstageReposListScaffold>
    );
  }

  return (
    <BackstageReposListScaffold
      totalPages={pagination.totalPages}
      bulkImportOpen={bulkImportOpen}
      onBulkImportOpenChange={setBulkImportOpen}
      untrackedRepoFullNames={untrackedRepoFullNames}
      isBulkImporting={bulkImportMutation.isPending}
      onBulkImportConfirm={(options) => bulkImportMutation.mutate(options)}
      isImportBusy={isImportBusy}
      isRefetchingRepos={isRefetchingRepos}
    >
      <p className="text-muted-foreground text-sm">
        Showing {pageRepoRows.length} of {pagination.totalItems}{" "}
        {hasActiveFilters ? "matching " : ""}
        repos · {trackedCount} already in projects · {untrackedRepoFullNames.length} not imported
      </p>

      <div
        className="divide-base-content/10 divide-y rounded-lg border border-base-content/10"
        data-test="backstage-repos-list"
      >
        {pageRepoRows.map((row) => (
          <BackstageRepoRow
            key={row.repo.id}
            repo={row.repo}
            isTracked={row.isTracked}
            isImporting={isRowWorking(row.repo.nameWithOwner)}
            onImport={(options) => importMutation.mutate(options)}
            disabled={isImportBusy}
          />
        ))}
      </div>
    </BackstageReposListScaffold>
  );
}

function ReposEmpty({
  hasActiveFilters,
  hasGithubErrors,
  query,
}: {
  hasActiveFilters: boolean;
  hasGithubErrors: boolean;
  query: string;
}) {
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);

  if (hasActiveFilters) {
    return (
      <Empty data-test="backstage-repos-search-empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>
            {query ? `No repos match “${query}”` : "No repos match your filters"}
          </EmptyTitle>
          <EmptyDescription>
            Try clearing search or filters to see more repositories.
          </EmptyDescription>
        </EmptyHeader>
        {query ? (
          <EmptyContent>
            <Button
              type="button"
              variant="outline"
              onClick={clearSearch}
              data-test="backstage-repos-clear-search"
            >
              Clear search
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  if (hasGithubErrors) {
    return (
      <Empty data-test="backstage-repos-empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FaGithub />
          </EmptyMedia>
          <EmptyTitle>No accessible repos</EmptyTitle>
          <EmptyDescription>
            Org-restricted repos are skipped when your PAT exceeds the org token lifetime policy.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty data-test="backstage-repos-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FaGithub />
        </EmptyMedia>
        <EmptyTitle>No repos found</EmptyTitle>
        <EmptyDescription>Refresh to pull your most recently pushed repositories.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

interface BackstageReposListScaffoldProps {
  children: React.ReactNode;
  totalPages?: number;
  bulkImportOpen: boolean;
  onBulkImportOpenChange: (open: boolean) => void;
  untrackedRepoFullNames: string[];
  isBulkImporting: boolean;
  onBulkImportConfirm: (options: BulkImportProjectOptions) => void;
  isImportBusy: boolean;
  isRefetchingRepos: boolean;
}

function BackstageReposListScaffold({
  children,
  totalPages = 0,
  bulkImportOpen,
  onBulkImportOpenChange,
  untrackedRepoFullNames,
  isBulkImporting,
  onBulkImportConfirm,
  isImportBusy,
  isRefetchingRepos,
}: BackstageReposListScaffoldProps) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(ROUTE_ID);

  const tracked = search.tracked ?? "all";
  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const activeFilterCount =
    (tracked !== "all" ? 1 : 0) + (visibility !== "all" ? 1 : 0) + (archived !== "all" ? 1 : 0);

  function patchSearch(patch: Partial<BackstageReposSearch>) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: undefined,
      }),
      replace: true,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-repos">
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={onBulkImportOpenChange}
        repoFullNames={untrackedRepoFullNames}
        isImporting={isBulkImporting}
        onConfirm={onBulkImportConfirm}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <FaGithub className="size-6" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight">GitHub</h1>
          </div>
          <p className="text-muted-foreground text-sm">
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
            onClick={() => onBulkImportOpenChange(true)}
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
            keyword={inputValue}
            setKeyword={(value) => onSearchChange(value)}
            isDebouncing={isDebouncing}
            inputProps={{
              placeholder: "Search repos…",
            }}
          />
        </div>
        <BackstageFiltersDialog
          data-test="backstage-repos-filters"
          activeFilterCount={activeFilterCount}
          onClear={() =>
            patchSearch({
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
                patchSearch({
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
                patchSearch({
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
                patchSearch({
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

      {children}

      <TSRListPagination routeID={ROUTE_ID} totalPages={totalPages} />
    </div>
  );
}

export function BackstegReposPending() {
  return (
    <BackstageReposListScaffold
      totalPages={0}
      bulkImportOpen={false}
      onBulkImportOpenChange={() => {}}
      untrackedRepoFullNames={[]}
      isBulkImporting={false}
      onBulkImportConfirm={() => {}}
      isImportBusy={false}
      isRefetchingRepos={false}
    >
      <BackstagePending />
    </BackstageReposListScaffold>
  );
}
