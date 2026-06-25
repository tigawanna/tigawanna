import type { PinnedViewerReposResponse, RequestError, ViewerPinnedRepoData } from "@/types/github";
import { createServerFn } from "@tanstack/react-start";
import { fetchPinnedReposFromGithub, fetchRecentReposFromGithub } from "./fetch-repos";

export const getPinnedRepos = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const nodes = await fetchPinnedReposFromGithub();
    return {
      data: {
        viewer: {
          pinnedItems: { nodes },
          repositories: { nodes: [] },
        },
      },
    } satisfies PinnedViewerReposResponse;
  } catch {
    return null;
  }
});

export const getRecentRepos = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const result = await fetchRecentReposFromGithub();

    return {
      data: result.data as ViewerPinnedRepoData | null,
      errors: (result.errors ?? []) as RequestError[],
    };
  } catch {
    return { data: null, errors: [] as RequestError[] };
  }
});
