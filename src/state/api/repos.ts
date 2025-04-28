import { envVariables } from "@/env";


export interface ViewerPinnedRepoError {
  errors: RequestError[];
}
export interface RepositoryTopic {
  topic: {
    name: string;
  };
}
export interface RequestError {
  path: string[];
  extensions: Extensions;
  locations: Location[];
  message: string;
}

export interface Extensions {
  code: string;
  typeName: string;
  fieldName: string;
}

export interface Location {
  line: number;
  column: number;
}

export interface ViewerPinnedRepo {
  data: ViewerPinnedRepoData;
}

export interface ViewerPinnedRepoData {
  viewer: Viewer;
}

export interface Viewer {
  pinnedItems: PinnedItems;
  repositories: PinnedItems;
}

export interface PinnedItems {
  nodes: PinnedItemsNode[];
}

export interface PinnedItemsNode {
  name: string;
  url: string;
  openGraphImageUrl: string;
  description?: string;
  descriptionHTML: string;
  homepageUrl: string;
  nameWithOwner: string;
  pushedAt: string;
  isPrivate: boolean;
  repositoryTopics: {
    nodes: RepositoryTopic[];
  };
}

export type PinnedViewerReposResponse =
  | ViewerPinnedRepo
  | ViewerPinnedRepoError;

export const ViewerPinnedRepoQuery = `
query getViewerPinnedRepos {
  viewer {
    pinnedItems(first: 10, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          name
          url
          openGraphImageUrl
          description
          descriptionHTML
          homepageUrl
          nameWithOwner
          url
          pushedAt
          isPrivate
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
}

`;

export async function getViewerPinnedRepos() {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${envVariables.GH_PAT}`,
      },
      body: JSON.stringify({
        query: ViewerPinnedRepoQuery,
      }),
    });
    if (!res.ok) {
      return new Error(res.statusText);
    }
    return (await res.json()) as PinnedViewerReposResponse;
  } catch (error) {
    throw error;
  }
}

export const ViewerLatsedPushedToRepos = `query getViewerRecentlyPushedRepos {
  viewer {
    repositories(orderBy: { field: PUSHED_AT, direction: DESC }, first: 100,  isFork: false ) {
      nodes {
        ... on Repository {
          name
          url
          openGraphImageUrl
          description
          descriptionHTML
          homepageUrl
          nameWithOwner
          url
          pushedAt
          isPrivate
            repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
}`;

export async function getViewerRecentlyPushedRepos():Promise<{
    data: null;
    errors:  RequestError[];
} | {
    data: ViewerPinnedRepoData;
    errors: RequestError[];
}> {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${envVariables.GH_PAT}`,
        cache: "no-store",
      },
      body: JSON.stringify({
        query: ViewerLatsedPushedToRepos,
      }),
    });
    if (!res.ok) {
      return {
        data: null,
        errors: [{
          message: res.statusText,
          path: [],
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            typeName: "ViewerPinnedRepo",
            fieldName: "getViewerRecentlyPushedRepos",
          },
          locations: [{
            line: 1,
            column: 1,
          }],
        }],
        };
    }
    const data = await res.json();
    return {
      data: data.data as ViewerPinnedRepoData,
      errors: data.errors as RequestError[],
    };
  } catch (error) {
    throw error;
  }
}
