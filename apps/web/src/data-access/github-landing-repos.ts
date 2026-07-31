import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createGitHubClient, type GithubRepoNode as GithubRepoNodeSource } from "@repo/github";

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

/**
 * Day-cached single-repo GraphQL fetch (fallback when the repo is not in the landing list).
 */
async function getCachedGithubRepoDetail(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`github-repo_${owner}/${repo}`);

  try {
    const pat = process.env.GH_PAT?.trim();
    if (!pat) return null;

    const detail = await createGitHubClient(pat).getRepoDetail(owner, repo);
    if (!detail || detail.isPrivate) return null;

    const topics =
      detail.repositoryTopics?.edges?.map((edge) => edge.node.topic.name).filter(Boolean) ?? [];

    return {
      name: detail.name,
      nameWithOwner: detail.nameWithOwner,
      url: detail.url,
      openGraphImageUrl: detail.openGraphImageUrl ?? "",
      description: detail.description || undefined,
      descriptionHTML: "",
      homepageUrl: detail.homepageUrl ?? "",
      pushedAt: detail.updatedAt,
      isPrivate: Boolean(detail.isPrivate),
      isFork: detail.isFork,
      forkCount: detail.forkCount,
      category: resolveRepositoryCategory(undefined, topics),
      repositoryTopics: {
        nodes: topics.map((topic) => ({ topic: { name: topic } })),
      },
    };
  } catch (err: unknown) {
    console.error(`[github-landing-repos] Failed to load ${owner}/${repo}`, err);
    return null;
  }
}

/**
 * Resolves one public repo for project detail media.
 *
 * Prefers the day-cached landing list (same source as project cards) so the
 * View Transition morph keeps the same OG URL. Falls back to a day-cached
 * single-repo GraphQL fetch when the repo is outside that list.
 */
export async function getCachedGithubRepoByName(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  const nameWithOwner = `${owner}/${repo}`;

  const landing = await getCachedGithubLandingRepos();
  if (landing) {
    const fromLanding =
      landing.recentRepos.find((entry) => entry.nameWithOwner === nameWithOwner) ??
      landing.pinnedRepos.find((entry) => entry.nameWithOwner === nameWithOwner);
    if (fromLanding) return fromLanding;
  }

  return getCachedGithubRepoDetail(owner, repo);
}
