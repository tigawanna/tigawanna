import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import type { PinnedViewerReposResponse, RequestError } from "@/types/github";
import { createServerFn } from "@tanstack/react-start";
import { fetchPinnedReposFromGithub, fetchRecentReposFromGithub } from "./fetch-repos";
import { setPublicGithubCacheHeaders } from "./public-cache-headers";

const staticPinnedResponse = {
  data: {
    viewer: {
      pinnedItems: { nodes: STATIC_PINNED_PROJECTS },
      repositories: { nodes: [] },
    },
  },
} satisfies PinnedViewerReposResponse;

const staticRecentResponse = {
  data: {
    viewer: {
      pinnedItems: { nodes: [] },
      repositories: { nodes: STATIC_RECENT_PROJECTS },
    },
  },
  errors: [] as RequestError[],
};

/**
 * When set (e2e / offline demos), skip live GitHub and serve static fixtures.
 */
function useStaticPortfolioFixtures() {
  return process.env.PORTFOLIO_USE_STATIC_FIXTURES === "1";
}

export const getPinnedRepos = createServerFn({ method: "GET" }).handler(async () => {
  if (useStaticPortfolioFixtures()) {
    return staticPinnedResponse;
  }

  try {
    const nodes = await fetchPinnedReposFromGithub();
    setPublicGithubCacheHeaders();
    return {
      data: {
        viewer: {
          pinnedItems: { nodes },
          repositories: { nodes: [] },
        },
      },
    } satisfies PinnedViewerReposResponse;
  } catch {
    return staticPinnedResponse;
  }
});

export const getRecentRepos = createServerFn({ method: "GET" }).handler(async () => {
  if (useStaticPortfolioFixtures()) {
    return staticRecentResponse;
  }

  try {
    const result = await fetchRecentReposFromGithub();
    setPublicGithubCacheHeaders();
    return {
      data: result.data,
      errors: result.errors,
    };
  } catch {
    return staticRecentResponse;
  }
});
