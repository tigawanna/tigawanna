import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { and, eq, ilike, IR, or, type InitialQueryBuilder } from "@tanstack/db";

export type GithubReposLiveQueryParams = {
  q: string;
  sortBy: "nameWithOwner" | "name" | "pushedAt" | "stargazerCount" | "forkCount";
  sortDirection: "asc" | "desc";
  visibility: "all" | "public" | "private";
  archived: "all" | "active" | "archived";
};

/**
 * Builds a TanStack DB live query for backstage GitHub repos.
 */
export function buildGithubReposLiveQuery({
  q,
  sortBy,
  sortDirection,
  visibility,
  archived,
}: GithubReposLiveQueryParams) {
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

        return clauses.slice(1).reduce((acc, clause) => and(acc, clause), clauses[0]!);
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
      .select(({ github }) => github);
  };
}
