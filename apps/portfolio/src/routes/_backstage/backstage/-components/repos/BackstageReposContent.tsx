import {
  buildGithubReposCountLiveQuery,
  buildGithubReposPageLiveQuery,
} from "@/data-access-layer/backstage/github/backstage-github-repos-query";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
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

  const filters = { q, visibility, archived };

  const { data: repos } = useLiveSuspenseQuery(
    buildGithubReposPageLiveQuery({
      ...filters,
      sortBy,
      sortDirection,
      page,
      perPage: BACKSTAGE_LIST_PER_PAGE,
    }),
    [q, sortBy, sortDirection, visibility, archived, page],
  );

  const { data: matchingRepos } = useLiveSuspenseQuery(buildGithubReposCountLiveQuery(filters), [
    q,
    visibility,
    archived,
  ]);

  const totalItems = matchingRepos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / BACKSTAGE_LIST_PER_PAGE));

  if (totalItems === 0) {
    return (
      <BackstageReposListScaffold totalPages={0}>
        <BackstageReposEmpty hasActiveFilters={hasActiveFilters} query={q.trim()} />
      </BackstageReposListScaffold>
    );
  }

  return (
    <BackstageReposListScaffold totalPages={totalPages}>
      <p className="text-muted-foreground text-sm">
        Showing {repos.length} of {totalItems}
        {hasActiveFilters ? " matching" : ""} repos
      </p>
      <div
        className="divide-base-content/10 divide-y rounded-lg border border-base-content/10"
        data-test="backstage-repos-list"
      >
        {repos.map((item) => (
          <BackstageRepoRow key={item.repo.id} repo={item.repo} isImported={item.isImported} />
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
