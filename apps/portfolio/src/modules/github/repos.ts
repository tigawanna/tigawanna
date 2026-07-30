import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import type { PinnedViewerReposResponse, RequestError } from "@/types/github";
import { createServerFn } from "@tanstack/react-start";
import { fetchRepositoriesFromCms } from "./fetch-cms-repos";
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

/**
 * Builds pinned/recent responses from the Payload CMS cache when GitHub fails.
 * Falls back to static fixtures only if the CMS is empty/unreachable.
 */
async function cmsOrStaticPinned() {
  const cms = await fetchRepositoriesFromCms();
  if (!cms) return staticPinnedResponse;
  return {
    data: {
      viewer: {
        pinnedItems: { nodes: cms.pinned },
        repositories: { nodes: [] },
      },
    },
  } satisfies PinnedViewerReposResponse;
}

/**
 * Builds recent-repo response from CMS, else static fixtures.
 */
async function cmsOrStaticRecent() {
  const cms = await fetchRepositoriesFromCms();
  if (!cms) return staticRecentResponse;
  return {
    data: {
      viewer: {
        pinnedItems: { nodes: [] },
        repositories: { nodes: cms.recent },
      },
    },
    errors: [] as RequestError[],
  };
}

export const getPinnedRepos = createServerFn({ method: "GET" }).handler(async () => {
  if (useStaticPortfolioFixtures()) {
    return staticPinnedResponse;
  }

  try {
    const nodes = await fetchPinnedReposFromGithub();
    if (nodes.length === 0) {
      return cmsOrStaticPinned();
    }
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
    return cmsOrStaticPinned();
  }
});

export const getRecentRepos = createServerFn({ method: "GET" }).handler(async () => {
  if (useStaticPortfolioFixtures()) {
    return staticRecentResponse;
  }

  try {
    const result = await fetchRecentReposFromGithub();
    const nodes = result.data?.viewer.repositories.nodes ?? [];
    if (nodes.length === 0) {
      return cmsOrStaticRecent();
    }
    setPublicGithubCacheHeaders();
    return {
      data: result.data,
      errors: result.errors,
    };
  } catch {
    return cmsOrStaticRecent();
  }
});
