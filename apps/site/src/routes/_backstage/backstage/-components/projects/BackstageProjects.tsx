import { SearchBox } from "@/components/search/SearchBox";
import { Badge } from "@/components/ui/badge";
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
import {
  importBackstageProject,
  type ImportBackstageProjectInput,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import { backstageGithubReposCollection } from "@/data-access-layer/backstage/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/backstage-projects-collection";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { useTSRSearchQuery } from "@/routes/_backstage/backstage/-hooks/use-tsr-search-query";
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { cn } from "@/lib/utils";
import { and, eq, ilike, IR, isNull, not, or } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import {
  Download,
  ExternalLink,
  FolderCodeIcon,
  GitFork,
  Github,
  Loader,
  Star,
} from "lucide-react";
import { toast } from "sonner";
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

function ProjectListRow({
  row,
  isImporting,
  importDisabled,
  onImport,
}: {
  row: JoinedRepoRow;
  isImporting: boolean;
  importDisabled: boolean;
  onImport: () => void;
}) {
  const repo = row.github;
  const project = row.projects;
  const isImported = project != null;

  if (isImported) {
    return <BackstageProjectRow project={project} isPrivate={repo.isPrivate} showImportedBadge />;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-4 px-4 py-4",
        "border-base-content/10 bg-base-100/50 border border-dashed",
      )}
      data-test="github-only-project-row"
    >
      {repo.openGraphImageUrl ? (
        <img
          src={repo.openGraphImageUrl}
          alt=""
          className="border-base-content/10 size-16 shrink-0 rounded-lg border object-cover opacity-90"
        />
      ) : (
        <div className="bg-base-200 border-base-content/10 flex size-16 shrink-0 items-center justify-center rounded-lg border">
          <Github className="text-base-content/40 size-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            {repo.nameWithOwner}
          </a>
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            data-test="project-status-badge"
          >
            <Github className="size-3" />
            Not imported
          </Badge>
          {repo.isPrivate ? <Badge variant="outline">private</Badge> : null}
          {repo.isArchived ? <Badge variant="outline">archived</Badge> : null}
        </div>

        <p className="text-base-content/60 mt-1 text-sm">
          {repo.description || "(no description)"}
        </p>

        <div className="text-base-content/40 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3" />
            {repo.stargazerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3" />
            {repo.forkCount}
          </span>
          <span>Pushed {formatDistanceToNow(new Date(repo.pushedAt), { addSuffix: true })}</span>
          {repo.homepageUrl ? (
            <a
              href={repo.homepageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              Homepage
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </div>

      <Button
        data-test="import-github-project"
        size="sm"
        disabled={importDisabled || isImporting}
        onClick={onImport}
        className="gap-1.5"
      >
        {isImporting ? (
          <>
            <Loader className="size-3.5 animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <Download className="size-3.5" />
            Import project
          </>
        )}
      </Button>
    </div>
  );
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

  const importMutation = useMutation({
    mutationFn: async (input: ImportBackstageProjectInput) => {
      const tx = importBackstageProject(input);
      await tx.isPersisted.promise;
    },
    onSuccess(_data, input) {
      toast.success("Imported to projects", { description: input.repoFullName });
    },
    onError(err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    },
  });

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
              <ProjectListRow
                key={row.github.nameWithOwner}
                row={row}
                isImporting={
                  importMutation.isPending &&
                  importMutation.variables?.repoFullName === row.github.nameWithOwner
                }
                importDisabled={importMutation.isPending}
                onImport={() =>
                  importMutation.mutate({
                    repoFullName: row.github.nameWithOwner,
                    runEnrichment: false,
                  })
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
