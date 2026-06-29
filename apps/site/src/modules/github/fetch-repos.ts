import type { GithubRepoNode } from "@/types/github";
import { getServerEnv } from "@/lib/envs/server-env";

export type GithubRepoOrderField =
  | "CREATED_AT"
  | "UPDATED_AT"
  | "PUSHED_AT"
  | "NAME"
  | "STARGAZERS";
export type GithubOrderDirection = "ASC" | "DESC";

export type FetchRecentReposOptions = {
  first?: number;
  isFork?: boolean;
  orderField?: GithubRepoOrderField;
  orderDirection?: GithubOrderDirection;
};

const RECENT_REPOS_QUERY = `query getViewerRecentlyPushedRepos(
  $first: Int!,
  $isFork: Boolean,
  $orderField: RepositoryOrderField!,
  $orderDirection: OrderDirection!
) {
  viewer {
    repositories(
      orderBy: { field: $orderField, direction: $orderDirection },
      first: $first,
      isFork: $isFork
    ) {
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
          isFork
          isArchived
          stargazerCount
          forkCount
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
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return pat;
}

export async function githubGraphql<T>(
  query: string,
  options?: { cache?: RequestCache; variables?: Record<string, unknown> },
): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getGithubPat()}`,
    },
    cache: options?.cache,
    body: JSON.stringify({
      query,
      variables: options?.variables,
    }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json() as Promise<T>;
}

export async function fetchRecentReposForIndexing() {
  const result = await githubGraphql<RecentReposResponse>(RECENT_REPOS_QUERY, {
    variables: {
      first: 100,
      isFork: false,
      orderField: "PUSHED_AT",
      orderDirection: "DESC",
    },
  });
  const nodes = (result.data?.viewer.repositories.nodes ?? []).filter(
    (repo): repo is GithubRepoNode => repo != null,
  );
  return nodes.filter((repo) => !repo.isPrivate);
}

export async function fetchPinnedReposFromGithub() {
  const result = await githubGraphql<PinnedReposResponse>(PINNED_REPOS_QUERY);
  return (result.data?.viewer.pinnedItems.nodes ?? []).filter(
    (repo): repo is GithubRepoNode => repo != null,
  );
}

/**
 * Fetches the viewer's recent GitHub repositories via GraphQL.
 *
 * @param options - Query limits and GitHub-side sort (`orderField` / `orderDirection`).
 */
export async function fetchRecentReposFromGithub(options: FetchRecentReposOptions = {}) {
  const {
    first = 100,
    isFork = false,
    orderField = "PUSHED_AT",
    orderDirection = "DESC",
  } = options;

  const result = await githubGraphql<RecentReposResponse>(RECENT_REPOS_QUERY, {
    cache: "no-store",
    variables: { first, isFork, orderField, orderDirection },
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
