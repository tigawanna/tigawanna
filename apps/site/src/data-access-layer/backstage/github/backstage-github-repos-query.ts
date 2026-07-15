import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { BACKSTAGE_LIST_PER_PAGE } from "@/data-access-layer/backstage/shared-query-options";
import { and, eq, ilike, IR, or, type InitialQueryBuilder } from "@tanstack/db";

export type GithubReposLiveQueryParams = {
  q: string;
  sortBy: "nameWithOwner" | "name" | "pushedAt" | "stargazerCount" | "forkCount";
  sortDirection: "asc" | "desc";
  visibility: "all" | "public" | "private";
  archived: "all" | "active" | "archived";
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
 * Builds a TanStack DB live query for backstage GitHub repos with native limit/offset pagination.
 */
export function buildGithubReposLiveQuery({
  q,
  sortBy,
  sortDirection,
  visibility,
  archived,
  page = 1,
  perPage = BACKSTAGE_LIST_PER_PAGE,
}: GithubReposLiveQueryParams) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const offset = (safePage - 1) * safePerPage;

  return (queryBuilder: InitialQueryBuilder) => {
    let query = queryBuilder.from({ github: backstageGithubReposCollection });

    if (q || visibility !== "all" || archived !== "all") {
      query = query.where(({ github }) => {
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
      .offset(offset)
      .limit(safePerPage)
      .select(({ github }) => github);
  };
}

/**
 * Builds a TanStack DB live query that returns all rows matching backstage repo filters.
 *
 * Used for total counts before applying limit/offset pagination.
 */
export function buildGithubReposFilteredLiveQuery({
  q,
  visibility,
  archived,
}: Pick<GithubReposLiveQueryParams, "q" | "visibility" | "archived">) {
  return (queryBuilder: InitialQueryBuilder) => {
    let query = queryBuilder.from({ github: backstageGithubReposCollection });

    if (q || visibility !== "all" || archived !== "all") {
      query = query.where(({ github }) => {
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

    return query.select(({ github }) => ({ nameWithOwner: github.nameWithOwner }));
  };
}
