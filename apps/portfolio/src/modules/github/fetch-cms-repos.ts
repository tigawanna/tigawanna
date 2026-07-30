import type { GithubRepoNode } from "@/types/github";
import { getServerEnv } from "@/lib/envs/server-env";

type PayloadRepositoryDoc = {
  name: string;
  nameWithOwner: string;
  url: string;
  homepageUrl?: string | null;
  openGraphImageUrl?: string | null;
  description?: string | null;
  descriptionHTML?: string | null;
  pushedAt: string;
  isPrivate?: boolean | null;
  isFork?: boolean | null;
  isArchived?: boolean | null;
  stargazerCount?: number | null;
  forkCount?: number | null;
  featured?: boolean | null;
  topics?: { tag: string }[] | null;
};

type PayloadListResponse = {
  docs: PayloadRepositoryDoc[];
};

/**
 * Resolves the Payload CMS origin used for repository fallbacks.
 */
function resolveCmsBaseUrl(): string {
  const fromEnv = getServerEnv().PAYLOAD_CMS_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://www.tigawanna.vip";
}

/**
 * Maps a Payload repository document into the project-card shape.
 */
function toGithubRepoNode(doc: PayloadRepositoryDoc): GithubRepoNode {
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
 * Fetches cached repositories from the Payload CMS public REST API.
 * Returns null when the CMS is unreachable or empty.
 */
export async function fetchRepositoriesFromCms(): Promise<{
  pinned: GithubRepoNode[];
  recent: GithubRepoNode[];
} | null> {
  const base = resolveCmsBaseUrl();
  const url = `${base}/api/repositories?limit=100&sort=-pushedAt&depth=0`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Avoid hanging the portfolio request when CMS is down.
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as PayloadListResponse;
    if (!Array.isArray(data.docs) || data.docs.length === 0) return null;

    const recent = data.docs.map(toGithubRepoNode);
    const pinned = data.docs.filter((doc) => doc.featured).map(toGithubRepoNode);

    return {
      pinned: pinned.length > 0 ? pinned : recent.slice(0, 6),
      recent,
    };
  } catch {
    return null;
  }
}
