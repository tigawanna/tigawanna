import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/components/landing/data/static";
import type { GithubRepoNode } from "@/components/landing/types/github";
import type { Repository } from "@/payload-types";

/**
 * Maps a Payload repository document into the project-card shape.
 */
export function toGithubRepoNode(doc: Repository): GithubRepoNode {
  return {
    name: doc.name,
    nameWithOwner: doc.nameWithOwner,
    url: doc.url,
    homepageUrl: doc.homepageUrl ?? "",
    openGraphImageUrl: doc.openGraphImageUrl ?? "",
    description: doc.description ?? undefined,
    descriptionHTML: doc.descriptionHTML ?? "",
    pushedAt: doc.pushedAt,
    isPrivate: Boolean(doc.isPrivate),
    isFork: Boolean(doc.isFork),
    isArchived: Boolean(doc.isArchived),
    stargazerCount: doc.stargazerCount ?? undefined,
    forkCount: doc.forkCount ?? undefined,
    repositoryTopics: {
      nodes: (doc.topics ?? [])
        .map((row) => row.tag)
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => ({ topic: { name: tag } })),
    },
  };
}

/**
 * Loads all cached repositories from Payload, newest push first.
 */
async function findCachedRepositories(): Promise<Repository[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "repositories",
    limit: 100,
    depth: 0,
    sort: "-pushedAt",
    overrideAccess: true,
  });
  return result.docs;
}

/**
 * Featured (pinned) repos from the CMS cache.
 */
export async function getCachedPinnedRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-pinned-repos");

  try {
    const docs = await findCachedRepositories();
    const featured = docs.filter((doc) => doc.featured).map(toGithubRepoNode);
    if (featured.length > 0) return featured;
  } catch {
    // CMS unavailable — fall through
  }

  return STATIC_PINNED_PROJECTS;
}

/**
 * Recent repos from the CMS cache (all synced rows).
 */
export async function getCachedRecentRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-recent-repos");

  try {
    const docs = await findCachedRepositories();
    if (docs.length > 0) return docs.map(toGithubRepoNode);
  } catch {
    // CMS unavailable — fall through
  }

  return STATIC_RECENT_PROJECTS;
}
