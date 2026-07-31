import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createGitHubClient, type GithubRepoNode as GithubRepoNodeSource } from "@repo/github";

import type { GithubRepoNode } from "@/components/landing/types/github";
import { listGithubRepos } from "@/modules/github/list-github-repos";
import { resolveRepositoryCategory } from "@/modules/github/repository-category";
import { loadPayloadLandingReposCached } from "@/data-access/repositories";

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
 * Day-cached GitHub list. Throws on failure so Next does not cache empty/error results.
 */
async function loadGithubLandingReposCached(): Promise<GithubLandingRepos> {
  "use cache";
  cacheLife("days");
  cacheTag("landing-github-live-repos");

  // TEMP: force Payload fallback — delete this line to restore live GitHub.
  throw new Error("[debug] Live GitHub landing fetch disabled to test Payload backup.");

  if (!process.env.GH_PAT?.trim()) {
    throw new Error("GH_PAT is not set; cannot load landing GitHub repos.");
  }

  const listed = await listGithubRepos({ recentLimit: 100 });
  if (listed.repos.length === 0) {
    throw new Error("GitHub list returned zero public repositories.");
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
    throw new Error("GitHub list mapped to zero pinned/recent repositories.");
  }

  return { pinnedRepos, recentRepos };
}

/**
 * Live GitHub pinned + recent repos for the landing projects section.
 *
 * 1. Day-cached GitHub GraphQL (throws on failure → miss not cached)
 * 2. Hour-cached Payload backup (throws on empty/unavailable → miss not cached)
 * 3. `null` — hide the projects section; never cached as a success
 */
export async function getCachedGithubLandingRepos(): Promise<GithubLandingRepos | null> {
  try {
    return await loadGithubLandingReposCached();
  } catch (err: unknown) {
    console.error("[github-landing-repos] GitHub live fetch failed; trying Payload backup", err);
  }

  try {
    return await loadPayloadLandingReposCached();
  } catch (err: unknown) {
    console.error(
      "[github-landing-repos] Payload backup also failed; hiding projects section",
      err,
    );
    return null;
  }
}

/**
 * Day-cached single-repo GraphQL fetch. Throws on failure so errors are not cached.
 */
async function loadGithubRepoDetailCached(owner: string, repo: string): Promise<GithubRepoNode> {
  "use cache";
  cacheLife("days");
  cacheTag(`github-repo_${owner}/${repo}`);

  const pat = process.env.GH_PAT?.trim();
  if (!pat) {
    throw new Error(`GH_PAT is not set; cannot load ${owner}/${repo}.`);
  }

  const detail = await createGitHubClient(pat).getRepoDetail(owner, repo);
  if (!detail) {
    throw new Error(`GitHub returned no repository for ${owner}/${repo}.`);
  }
  if (detail.isPrivate) {
    throw new Error(`Repository ${owner}/${repo} is private.`);
  }

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
}

/**
 * Day-cached single-repo fetch (fallback when the repo is not in the landing list).
 * Logs and returns `null` on failure without caching the miss.
 */
async function getCachedGithubRepoDetail(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  try {
    return await loadGithubRepoDetailCached(owner, repo);
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
