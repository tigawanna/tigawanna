import type { Payload, TypedUser } from "payload";
import type { GithubRepoNode } from "@repo/github";

import {
  inferRepositoryCategory,
  isRepositoryCategory,
  type RepositoryCategory,
} from "./repository-category";

export type RepoAccessOptions = {
  user?: TypedUser | null;
};

/**
 * Topic names from a GitHub repo node.
 *
 * @param repo - GitHub GraphQL repo node.
 */
export function topicNames(repo: GithubRepoNode): string[] {
  return (repo.repositoryTopics?.nodes ?? [])
    .map((node) => node.topic?.name)
    .filter((tag): tag is string => Boolean(tag));
}

/**
 * Resolves category for upsert: keep an existing manual value, otherwise infer from topics.
 *
 * @param repo - Incoming GitHub node.
 * @param existingCategory - Stored category if any.
 */
export function resolveCategory(
  repo: GithubRepoNode,
  existingCategory: string | null | undefined,
): RepositoryCategory {
  if (isRepositoryCategory(existingCategory)) {
    return existingCategory;
  }
  return inferRepositoryCategory(topicNames(repo));
}

/**
 * Clears `featured` on rows that are no longer GitHub-pinned.
 *
 * @param payload - Payload instance.
 * @param pinnedKeys - Current pin set (`nameWithOwner`).
 * @param access - Optional user for access control.
 * @returns How many rows were unfeatured.
 */
export async function clearStaleFeaturedFlags(
  payload: Payload,
  pinnedKeys: string[],
  access?: RepoAccessOptions,
): Promise<number> {
  if (pinnedKeys.length === 0) return 0;

  const flags = {
    user: access?.user ?? undefined,
    overrideAccess: !access?.user,
  };
  const previouslyFeatured = await payload.find({
    collection: "repositories",
    where: {
      and: [{ featured: { equals: true } }, { nameWithOwner: { not_in: pinnedKeys } }],
    },
    limit: 100,
    depth: 0,
    ...flags,
  });

  let updated = 0;
  for (const row of previouslyFeatured.docs) {
    try {
      await payload.update({
        collection: "repositories",
        id: row.id,
        data: { featured: false },
        context: { disableRevalidate: true },
        ...flags,
      });
      updated += 1;
    } catch (err: unknown) {
      console.error(`[repositories] Failed to unfeature ${row.nameWithOwner}`, err);
    }
  }
  return updated;
}
