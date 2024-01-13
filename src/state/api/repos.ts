


export interface ViewerPinnedRepoError {
  errors: Error[]
}

export interface Error {
  path: string[]
  extensions: Extensions
  locations: Location[]
  message: string
}

export interface Extensions {
  code: string
  typeName: string
  fieldName: string
}

export interface Location {
  line: number
  column: number
}



export interface ViewerPinnedRepo {
  data: ViewerPinnedRepoData
}

export interface ViewerPinnedRepoData {
  viewer: Viewer
}

export interface Viewer {
  pinnedItems: PinnedItems
  repositories: PinnedItems
}

export interface PinnedItems {
  nodes: PinnedItemsNode[]
}

export interface PinnedItemsNode {
  name: string
  url: string
  openGraphImageUrl: string
  description?: string
  descriptionHTML: string
  homepageUrl: string;
  nameWithOwner: string;
  pushedAt: string;
}


export type PinnedViewerReposResponse = ViewerPinnedRepo | ViewerPinnedRepoError

export const ViewerPinnedRepoQuery = `
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
          url
          pushedAt
        }
      }
    }
  }
}

`;


export async function getViewerPinnedRepos() {

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GH_PAT}`,
      },
      body: JSON.stringify({
        query: ViewerPinnedRepoQuery,
      }),
    })
  if(!res.ok){
    return new Error(res.statusText)
  }
    return await res.json() as PinnedViewerReposResponse;

  } catch (error) {
    throw error 
  }

}

export const ViewerLatsedPushedToRepos =`query getViewerRecentlyPushedRepos {
  viewer {
    repositories(orderBy: { field: PUSHED_AT, direction: DESC }, first: 3,  isFork: false ) {
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
        }
      }
    }
  }
}`

export async function getViewerRecentlyPushedRepos() {
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GH_PAT}`,
      },
      body: JSON.stringify({
        query: ViewerLatsedPushedToRepos,
      }),
    })
    if (!res.ok) {
      return new Error(res.statusText)
    }
    return await res.json() as PinnedViewerReposResponse;

  } catch (error) {
    throw error
  } 
}
