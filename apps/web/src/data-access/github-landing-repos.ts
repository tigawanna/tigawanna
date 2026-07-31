import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { GithubRepoNode as GithubRepoNodeSource } from "@repo/github";

import type { GithubRepoNode } from "@/components/landing/types/github";
import { listGithubRepos } from "@/modules/github/list-github-repos";
import { resolveRepositoryCategory } from "@/modules/github/repository-category";

export type GithubLandingRepos = {
  pinnedRepos: GithubRepoNode[];
  recentRepos: GithubRepoNode[];
};

/**
 * Maps a GraphQL repo node into the landing card shape, inferring category from topics.
 */
function toLandingRepo(node: GithubRepoNodeSource): GithubRepoNode {
  const topics = node.repositoryTopics?.nodes?.map((entry) => entry.topic.name) ?? [];
  return {
    name: node.name,
    url: node.url,
    openGraphImageUrl: node.openGraphImageUrl ?? "",
    description: node.description,
    descriptionHTML: node.descriptionHTML ?? "",
    homepageUrl: node.homepageUrl ?? "",
    nameWithOwner: node.nameWithOwner,
    pushedAt: node.pushedAt,
    isPrivate: Boolean(node.isPrivate),
    isFork: node.isFork,
    isArchived: node.isArchived,
    stargazerCount: node.stargazerCount,
    forkCount: node.forkCount,
    category: resolveRepositoryCategory(undefined, topics),
    repositoryTopics: {
      nodes: (node.repositoryTopics?.nodes ?? []).map((entry) => ({
        topic: { name: entry.topic.name },
      })),
    },
  };
}

/**
 * Live GitHub pinned + recent repos for the landing projects section.
 *
 * Cached for ~1 day via Cache Components so visitors share one GraphQL pull
 * instead of hitting the PAT on every page load (and so OG image URLs are
 * refreshed periodically instead of going stale in Payload).
 *
 * Returns `null` when the token is missing, GitHub errors, or the list is empty —
 * callers should hide the projects section entirely in that case.
 */
export async function getCachedGithubLandingRepos(): Promise<GithubLandingRepos | null> {
  "use cache";
  cacheLife("days");
  cacheTag("landing-github-live-repos");

  try {
    if (!process.env.GH_PAT?.trim()) {
      return null;
    }

    const listed = await listGithubRepos({ recentLimit: 100 });
    if (listed.repos.length === 0) {
      return null;
    }

    const byKey = new Map(
      listed.repos.map((entry) => [entry.node.nameWithOwner, toLandingRepo(entry.node)]),
    );

    const pinnedRepos = listed.pinnedKeys
      .map((key) => byKey.get(key))
      .filter((repo): repo is GithubRepoNode => repo != null);

    const recentRepos = [...byKey.values()].sort(
      (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime(),
    );

    if (pinnedRepos.length === 0 && recentRepos.length === 0) {
      return null;
    }

    return { pinnedRepos, recentRepos };
  } catch (err: unknown) {
    console.error("[github-landing-repos] Failed to load GitHub repos for landing", err);
    return null;
  }
}
