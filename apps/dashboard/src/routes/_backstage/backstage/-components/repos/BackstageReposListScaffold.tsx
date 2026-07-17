import { TSRListPagination } from "@/components/pagination/TSRListPagination";
import { SearchBox } from "@/components/search/SearchBox";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { TanstackDBSortSelect } from "@/routes/_backstage/backstage/-components/shared/TanstackDBColumnfilters";
import { createSortableColumns } from "@/routes/_backstage/backstage/-components/shared/sortable-columns";
import { RefreshCcwIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Route, type BackstageReposSearch } from "../../repos";
import { BackstageFilterField, BackstageFiltersDialog } from "../shared/BackstageFiltersDialog";

const ROUTE_ID = "/_backstage/backstage/repos";

const repoSortableColumns = createSortableColumns(backstageGithubReposCollection, [
  { value: "nameWithOwner", label: "Repository" },
  { value: "name", label: "Name" },
  { value: "pushedAt", label: "Last pushed" },
  { value: "stargazerCount", label: "Stars" },
  { value: "forkCount", label: "Forks" },
]);

type BackstageReposListScaffoldProps = {
  children: React.ReactNode;
  totalPages?: number;
};

export function BackstageReposListScaffold({
  children,
  totalPages = 0,
}: BackstageReposListScaffoldProps) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(ROUTE_ID);

  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const activeFilterCount = (visibility !== "all" ? 1 : 0) + (archived !== "all" ? 1 : 0);

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
        <Button
          variant="outline"
          size="icon"
          data-test="repos-refetch"
          aria-label="Refresh GitHub repos"
          onClick={() => backstageGithubReposCollection.utils.refetch()}
        >
          <RefreshCcwIcon className="size-4" />
        </Button>
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
              visibility: undefined,
              archived: undefined,
            })
          }
        >
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
