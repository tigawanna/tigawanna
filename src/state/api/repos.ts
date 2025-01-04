import { error } from "console";

export interface ViewerPinnedRepoError {
  errors: Error[];
}
export interface RepositoryTopic {
  topic: {
    name: string;
  };
}
export interface Error {
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
        Authorization: `Bearer ${process.env.GH_PAT}`,
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
    repositories(orderBy: { field: PUSHED_AT, direction: DESC }, first: 5,  isFork: false ) {
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

export async function getViewerRecentlyPushedRepos() {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GH_PAT}`,
        cache: "no-store",
      },
      body: JSON.stringify({
        query: ViewerLatsedPushedToRepos,
      }),
    });
    if (!res.ok) {
      return {
        data: null,
        errors: [new Error(res.statusText)]
        };
    }
    const data = await res.json();
    return {
      data: data.data as ViewerPinnedRepoData,
      errors: data.errors as Error[],
    };
  } catch (error) {
    throw error;
  }
}
