import type { Payload, TypedUser } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";
import { createGitHubClient, type GithubRepoNode } from "@repo/github";

import {
  inferRepositoryCategory,
  isRepositoryCategory,
  type RepositoryCategory,
} from "./repository-category";

export type SyncRepositoriesResult = {
  created: number;
  updated: number;
  featured: number;
  total: number;
  pulledAt: string;
};

type SyncOpOptions = {
  user?: TypedUser | null;
  /** How many recent public repos to pull (default 100). */
  recentLimit?: number;
};

/**
 * Resolves a GitHub PAT from env (`GH_PAT`).
 */
function requireGithubPat(): string {
  const pat = process.env.GH_PAT?.trim();
  if (!pat) {
    throw new Error("Set GH_PAT to sync repositories from GitHub.");
  }
  return pat;
}

/**
 * Busts Next.js cache tags for landing project cards.
 */
function bustRepositoryCaches() {
  try {
    revalidateTag("landing-pinned-repos", "max");
    revalidateTag("landing-recent-repos", "max");
    revalidatePath("/");
    revalidatePath("/projects");
  } catch {
    // Outside of a Next.js request (e.g. payload run) — ignore.
  }
}

/**
 * Topic names from a GitHub repo node.
 */
function topicNames(repo: GithubRepoNode): string[] {
  return (repo.repositoryTopics?.nodes ?? [])
    .map((node) => node.topic?.name)
    .filter((tag): tag is string => Boolean(tag));
}

/**
 * Resolves category for upsert: keep an existing manual value, otherwise infer from topics.
 */
function resolveCategory(
  repo: GithubRepoNode,
  existingCategory: string | null | undefined,
): RepositoryCategory {
  if (isRepositoryCategory(existingCategory)) {
    return existingCategory;
  }
  return inferRepositoryCategory(topicNames(repo));
}

/**
 * Maps a GitHub repo node into Payload repository field data.
 */
function toRepositoryData(
  repo: GithubRepoNode,
  featured: boolean,
  syncedAt: string,
  category: RepositoryCategory,
) {
  return {
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    url: repo.url,
    homepageUrl: repo.homepageUrl || "",
    openGraphImageUrl: repo.openGraphImageUrl || "",
    description: repo.description || "",
    descriptionHTML: repo.descriptionHTML || "",
    topics: topicNames(repo).map((tag) => ({ tag })),
    category,
    featured,
    pushedAt: repo.pushedAt,
    isPrivate: Boolean(repo.isPrivate),
    isFork: Boolean(repo.isFork),
    isArchived: Boolean(repo.isArchived),
    stargazerCount: repo.stargazerCount ?? 0,
    forkCount: repo.forkCount ?? 0,
    lastSyncedAt: syncedAt,
  };
}

/**
 * Pulls pinned + recent public repos from GitHub and upserts them into Payload.
 *
 * Featured = currently pinned on GitHub. Existing rows not in this pull keep
 * their data but lose featured if they were only featured via a previous pin.
 *
 * Category is inferred from topics only when the row has no category yet —
 * admin overrides are preserved across syncs.
 */
export async function syncRepositoriesFromGithub(
  payload: Payload,
  options: SyncOpOptions = {},
): Promise<SyncRepositoriesResult> {
  const client = createGitHubClient(requireGithubPat());
  const recentLimit = options.recentLimit ?? 100;
  const access = {
    user: options.user ?? undefined,
    overrideAccess: !options.user,
  };

  const [pinned, recentResult] = await Promise.all([
    client.getPinnedRepos(),
    client.getRecentRepos({ first: recentLimit, isFork: false }),
  ]);

  const recent = recentResult.data?.viewer.repositories.nodes ?? [];
  const pinnedKeys = new Set(pinned.map((repo) => repo.nameWithOwner));

  // Prefer the richer recent node when a repo appears in both lists.
  const byKey = new Map<string, GithubRepoNode>();
  for (const repo of recent) {
    byKey.set(repo.nameWithOwner, repo);
  }
  for (const repo of pinned) {
    if (!byKey.has(repo.nameWithOwner)) {
      byKey.set(repo.nameWithOwner, repo);
    }
  }

  const syncedAt = new Date().toISOString();
  let created = 0;
  let updated = 0;

  for (const repo of byKey.values()) {
    const existing = await payload.find({
      collection: "repositories",
      where: { nameWithOwner: { equals: repo.nameWithOwner } },
      limit: 1,
      depth: 0,
      ...access,
    });

    const row = existing.docs[0];
    const category = resolveCategory(repo, row?.category);
    const data = toRepositoryData(repo, pinnedKeys.has(repo.nameWithOwner), syncedAt, category);

    if (row) {
      await payload.update({
        collection: "repositories",
        id: row.id,
        data,
        context: { disableRevalidate: true },
        ...access,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "repositories",
        data,
        context: { disableRevalidate: true },
        ...access,
      });
      created += 1;
    }
  }

  // Clear featured on rows that are no longer GitHub-pinned.
  if (pinnedKeys.size > 0) {
    const previouslyFeatured = await payload.find({
      collection: "repositories",
      where: {
        and: [{ featured: { equals: true } }, { nameWithOwner: { not_in: [...pinnedKeys] } }],
      },
      limit: 100,
      depth: 0,
      ...access,
    });

    for (const row of previouslyFeatured.docs) {
      await payload.update({
        collection: "repositories",
        id: row.id,
        data: { featured: false },
        context: { disableRevalidate: true },
        ...access,
      });
      updated += 1;
    }
  }

  bustRepositoryCaches();

  return {
    created,
    updated,
    featured: pinnedKeys.size,
    total: byKey.size,
    pulledAt: syncedAt,
  };
}
