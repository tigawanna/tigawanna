import { buildGithubReposLiveQuery } from "@/data-access-layer/backstage/github/backstage-github-repos-query";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import { paginateItems } from "@/utils/paginate-items";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Route } from "../../repos";
import { BackstagePending } from "../shared/BackstagePending";
import { BackstageRepoRow } from "./BackstageRepoRow";
import { BackstageReposEmpty } from "./BackstageReposEmpty";
import { BackstageReposListScaffold } from "./BackstageReposListScaffold";

export function BackstageReposContent() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const sortBy = search.sortBy ?? "pushedAt";
  const sortDirection = search.sortDirection ?? "desc";
  const visibility = search.visibility ?? "all";
  const archived = search.archived ?? "all";
  const page = search.page ?? 1;
  const hasActiveFilters = Boolean(q || visibility !== "all" || archived !== "all");

  const { data: repos } = useLiveSuspenseQuery(
    buildGithubReposLiveQuery({ q, sortBy, sortDirection, visibility, archived }),
    [q, sortBy, sortDirection, visibility, archived],
  );

  const { items: pageRepos, pagination } = paginateItems(repos, page, BACKSTAGE_LIST_PER_PAGE);

  if (repos.length === 0) {
    return (
      <BackstageReposListScaffold totalPages={0}>
        <BackstageReposEmpty hasActiveFilters={hasActiveFilters} query={q.trim()} />
      </BackstageReposListScaffold>
    );
  }

  return (
    <BackstageReposListScaffold totalPages={pagination.totalPages}>
      <p className="text-muted-foreground text-sm">
        Showing {pageRepos.length} of {pagination.totalItems}
        {hasActiveFilters ? " matching" : ""} repos
      </p>
      <div
        className="divide-base-content/10 divide-y rounded-lg border border-base-content/10"
        data-test="backstage-repos-list"
      >
        {repos.map((repo) => (
          <BackstageRepoRow key={repo.id} repo={repo} />
        ))}
      </div>
    </BackstageReposListScaffold>
  );
}

export function BackstegReposPending() {
  return (
    <BackstageReposListScaffold totalPages={0}>
      <BackstagePending />
    </BackstageReposListScaffold>
  );
}
