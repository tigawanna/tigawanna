import type { GithubRepoNode } from "@/types/github";
import { getWorkerEnv } from "@/lib/worker-env";

const RECENT_REPOS_QUERY = `query getViewerRecentlyPushedRepos {
  viewer {
    repositories(orderBy: { field: PUSHED_AT, direction: DESC }, first: 100, isFork: false) {
      nodes {
        ... on Repository {
          name
          url
          openGraphImageUrl
          description
          descriptionHTML
          homepageUrl
          nameWithOwner
          pushedAt
          isPrivate
          repositoryTopics(first: 10) {
            nodes {
              topic { name }
            }
          }
        }
      }
    }
  }
}`;

const PINNED_REPOS_QUERY = `
query getViewerPinnedRepos {
  viewer {
    pinnedItems(first: 6, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          name
          url
          openGraphImageUrl
          description
          descriptionHTML
          homepageUrl
          nameWithOwner
          pushedAt
          isPrivate
          repositoryTopics(first: 10) {
            nodes {
              topic { name }
            }
          }
        }
      }
    }
  }
}`;

type RecentReposResponse = {
  data: {
    viewer: {
      repositories: { nodes: GithubRepoNode[] };
    };
  } | null;
  errors?: { message: string }[];
};

type PinnedReposResponse = {
  data: {
    viewer: {
      pinnedItems: { nodes: GithubRepoNode[] };
    };
  } | null;
  errors?: { message: string }[];
};

function getGithubPat() {
  const pat = getWorkerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return pat;
}

export async function githubGraphql<T>(
  query: string,
  options?: { cache?: RequestCache },
): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getGithubPat()}`,
    },
    cache: options?.cache,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json() as Promise<T>;
}

export async function fetchRecentReposForIndexing() {
  const result = await githubGraphql<RecentReposResponse>(RECENT_REPOS_QUERY);
  const nodes = result.data?.viewer.repositories.nodes ?? [];
  return nodes.filter((repo) => !repo.isPrivate);
}

export async function fetchPinnedReposFromGithub() {
  const result = await githubGraphql<PinnedReposResponse>(PINNED_REPOS_QUERY);
  return result.data?.viewer.pinnedItems.nodes ?? [];
}

export async function fetchRecentReposFromGithub() {
  const result = await githubGraphql<RecentReposResponse>(RECENT_REPOS_QUERY, {
    cache: "no-store",
  });
  return {
    data: result.data,
    errors: result.errors ?? [],
  };
}

export function extractRepoTags(repo: GithubRepoNode) {
  return (repo.repositoryTopics?.nodes ?? [])
    .map((node) => node.topic.name)
    .filter((tag) => tag.length > 0);
}

export function buildRepoSearchText(repo: GithubRepoNode) {
  const tags = extractRepoTags(repo);
  const parts = [
    `Repository: ${repo.name}`,
    `Full name: ${repo.nameWithOwner}`,
    repo.description ? `Description: ${repo.description}` : null,
    tags.length > 0 ? `Tags: ${tags.join(", ")}` : null,
  ];

  return parts.filter((part): part is string => Boolean(part)).join("\n");
}
