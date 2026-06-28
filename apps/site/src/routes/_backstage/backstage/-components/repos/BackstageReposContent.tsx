import { backstageGithubReposCollection } from "@/data-access-layer/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage-projects-collection";
import { importBackstageProject } from "@/data-access-layer/backstage-collection-mutations";
import { backstageGithubReposQueryOptions } from "@/data-access-layer/backstage/projects-query-options";
import { SearchBox } from "@/components/search/SearchBox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useTSRSearchQuery } from "@/routes/_backstage/backstage/-hooks/use-tsr-search-query";
import { unwrapUnknownError } from "@/utils/errors";
import { useQuery } from "@tanstack/react-query";
import { and, eq, ilike, isNull, not, or, IR } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BackstageRepoRow } from "./BackstageRepoRow";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";
import { Route, type BackstageReposSearch } from "../../repos";

const repoSortableColumns = createSortableColumns(backstageGithubReposCollection, [
  { value: "nameWithOwner", label: "Repository" },
  { value: "name", label: "Name" },
  { value: "pushedAt", label: "Last pushed" },
  { value: "stargazerCount", label: "Stars" },
  { value: "forkCount", label: "Forks" },
]);

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

  const sortBy = search.sortBy ?? "nameWithOwner";
  const sortDirection = search.sortDirection ?? "desc";
  const tracked = search.tracked ?? "all";
  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const hasActiveFilters = Boolean(
    debouncedValue || tracked !== "all" || visibility !== "all" || archived !== "all",
  );

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

  const { data: githubErrors = [] } = useQuery({
    ...backstageGithubReposQueryOptions,
    select: (data) => data.errors,
  });
  const [runEnrichmentOnImport, setRunEnrichmentOnImport] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const githubErrorsWarned = useRef(false);

  useEffect(() => {
    if (githubErrorsWarned.current || githubErrors.length === 0) {
      return;
    }
    githubErrorsWarned.current = true;
    const description =
      githubErrors.length > 1
        ? `${githubErrors[0]} (+${githubErrors.length - 1} more)`
        : githubErrors[0];
    toast.warning("Some repos could not be loaded from GitHub", { description });
  }, [githubErrors]);

  const trackedCount = repoRows.filter((row) => row.isTracked).length;

  const handleImport = async (repoFullName: string) => {
    setImportingRepo(repoFullName);
    try {
      const tx = importBackstageProject({ repoFullName, runEnrichment: runEnrichmentOnImport });
      await tx.isPersisted.promise;
      toast.success(
        runEnrichmentOnImport ? "Imported and enrichment started" : "Imported to projects",
        { description: repoFullName },
      );
    } catch (err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    } finally {
      setImportingRepo(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-repos">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repos</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Your 100 most recently pushed repos on GitHub. Import, change visibility, or delete.
        </p>
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
              defaultSortBy="nameWithOwner"
              defaultSortDirection="desc"
            />
          </BackstageFilterField>
        </BackstageFiltersDialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>GitHub repos</CardTitle>
            <CardDescription>
              {repoRows.length} {hasActiveFilters ? "matching" : ""} repos · {trackedCount} already
              in projects
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="run-enrichment-on-import"
              data-test="run-enrichment-on-import"
              checked={runEnrichmentOnImport}
              onCheckedChange={(checked) => setRunEnrichmentOnImport(checked === true)}
            />
            <Label htmlFor="run-enrichment-on-import" className="text-sm font-normal">
              Run enrichment on import
            </Label>
          </div>
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
                isImporting={importingRepo === row.repo.nameWithOwner}
                onImport={() => handleImport(row.repo.nameWithOwner)}
                disabled={importingRepo != null}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
