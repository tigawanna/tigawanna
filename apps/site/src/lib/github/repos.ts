import type { PinnedViewerReposResponse, RequestError, ViewerPinnedRepoData } from "@/types/github";
import { createServerFn } from "@tanstack/react-start";

const PINNED_QUERY = `
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

const RECENT_QUERY = `query getViewerRecentlyPushedRepos {
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

function getGithubPat() {
  const pat = process.env.GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return pat;
}

async function githubGraphql<T>(query: string): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getGithubPat()}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json() as Promise<T>;
}

export const getPinnedRepos = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return (await githubGraphql<PinnedViewerReposResponse>(PINNED_QUERY)) ?? null;
  } catch {
    return null;
  }
});

export const getRecentRepos = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const result = await githubGraphql<{
      data: ViewerPinnedRepoData | null;
      errors?: RequestError[];
    }>(RECENT_QUERY);

    return {
      data: result.data ?? null,
      errors: result.errors ?? [],
    };
  } catch {
    return { data: null, errors: [] as RequestError[] };
  }
});
