import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import type { BackstageGithubRepoListItem } from "@/types/backstage";
import { and, eq, ilike, IR, isNull, not, or, type InitialQueryBuilder } from "@tanstack/db";

export type { BackstageGithubRepoListItem };

export type GithubReposFilters = {
  q: string;
  visibility: "all" | "public" | "private";
  archived: "all" | "active" | "archived";
};

export type GithubReposLiveQueryParams = GithubReposFilters & {
  sortBy: "nameWithOwner" | "name" | "pushedAt" | "stargazerCount" | "forkCount";
  sortDirection: "asc" | "desc";
  page?: number;
  perPage?: number;
};

/**
 * Combines TanStack DB where clauses with `and`.
 */
function combineWhereClauses(clauses: Array<IR.BasicExpression<boolean>>) {
  return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
}

/**
 * Shared subquery: github repos left-joined to projects, filtered, with import status.
 *
 * Count and paginated list queries both `from({ item: ... })` this subquery so filters
 * live in one place (TanStack DB subquery pattern).
 */
function buildFilteredGithubReposSubquery(q: InitialQueryBuilder, filters: GithubReposFilters) {
  const { q: search, visibility, archived } = filters;

  let query = q
    .from({ github: backstageGithubReposCollection })
    .leftJoin({ projects: backstageProjectsCollection }, ({ github, projects }) =>
      eq(github.nameWithOwner, projects.repoFullName),
    );

  if (search || visibility !== "all" || archived !== "all") {
    query = query.where(({ github }) => {
      const clauses: Array<IR.BasicExpression<boolean>> = [];

      if (search) {
        clauses.push(
          or(
            ilike(github.nameWithOwner, `%${search}%`),
            ilike(github.name, `%${search}%`),
            ilike(github.description, `%${search}%`),
          ),
        );
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

  return query.select(({ github, projects }) => ({
    repo: github,
    isImported: not(isNull(projects.repoFullName)),
  }));
}

/**
 * Live query for the filtered repo count (one row per matching repo).
 */
export function buildGithubReposCountLiveQuery(filters: GithubReposFilters) {
  return (q: InitialQueryBuilder) =>
    q
      .from({ item: buildFilteredGithubReposSubquery(q, filters) })
      .select(({ item }) => ({ id: item.repo.nameWithOwner }));
}

/**
 * Live query for one page of filtered repos, sorted and joined to import status.
 */
export function buildGithubReposPageLiveQuery({
  q,
  visibility,
  archived,
  sortBy,
  sortDirection,
  page = 1,
  perPage = BACKSTAGE_LIST_PER_PAGE,
}: GithubReposLiveQueryParams) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const offset = (safePage - 1) * safePerPage;
  const filters = { q, visibility, archived };

  return (queryBuilder: InitialQueryBuilder) =>
    queryBuilder
      .from({ item: buildFilteredGithubReposSubquery(queryBuilder, filters) })
      .orderBy(({ item }) => {
        switch (sortBy) {
          case "name":
            return item.repo.name;
          case "pushedAt":
            return item.repo.pushedAt;
          case "stargazerCount":
            return item.repo.stargazerCount;
          case "forkCount":
            return item.repo.forkCount;
          default:
            return item.repo.nameWithOwner;
        }
      }, sortDirection)
      .offset(offset)
      .limit(safePerPage)
      .select(({ item }) => item);
}
