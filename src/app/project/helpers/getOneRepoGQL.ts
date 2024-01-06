import { fetchGraphQL } from "@/state/gql-fetch-helper";


export async function getOneRepoGQL({ repo, owner }: { repo: string; owner: string }) {
const operationsDoc = `
  query OneRepo($owner: String!, $repo: String!,$firstTopics:Int!,$firstColabs:Int!,$firstLangs: Int!) {
    repository(name: $repo, owner: $owner) {
      createdAt
      forkCount
      id
      homepageUrl
      isPrivate
      isFork
      isEmpty
        description
      isTemplate
      repositoryTopics(first: $firstTopics) {
        edges {
          node {
            id
            resourcePath
            topic {
              id
              name
              relatedTopics {
                id
              }
            }
          }
        }
      }
      licenseInfo {
        name
        id
        featured
        description
        body
        nickname
        url
        pseudoLicense
      }
      name
      nameWithOwner
      openGraphImageUrl
      updatedAt
      url
      collaborators(affiliation: OUTSIDE, first:$firstColabs) {
        totalCount
        nodes {
          avatarUrl
          bio
          company
          email
          id
          isViewer
          name
          login
          location
          url
          twitterUsername
          websiteUrl
        }
      }
      nameWithOwner
      languages(first: $firstLangs) {
        edges {
          cursor
          size
        node{
          color
          id
          name
        }
        }
        totalCount
        totalSize
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;
    try {
        const data = await fetchGraphQL({operationsDoc,variables:{
            owner,
            repo,
            firstTopics: 10,
            firstColabs: 10,
            firstLangs: 10
        },
    headers:{
        "Authorization": `Bearer ${process.env.GH_PAT}`
    }
    })
    // // no(" ONE GQL REPO === ",data)
    return data as OneRepoGQL
    } catch (error) {
        // no("ONE GQL ERROR === ",{error})
        return error as OneRepoGQL
    }
}



export interface OneRepoGQL {
    data: Data
}

export interface Data {
    repository: Repository
}

export interface Repository {
    createdAt: string
    forkCount: number
    id: string
    homepageUrl: string
    isPrivate: boolean
    description: string
    isFork: boolean
    isEmpty: boolean
    isTemplate: boolean
    repositoryTopics: RepositoryTopics
    licenseInfo: any
    name: string
    nameWithOwner: string
    openGraphImageUrl: string
    updatedAt: string
    url: string
    collaborators: Collaborators
    languages: Languages
}

export interface RepositoryTopics {
    edges: Edge[]
}

export interface Edge {
    node: Node
}

export interface Node {
    id: string
    resourcePath: string
    topic: Topic
}

export interface Topic {
    id: string
    name: string
    relatedTopics: any[]
}

export interface Collaborators {
    totalCount: number
    nodes: any[]
}

export interface Languages {
    edges: Edge2[]
    totalCount: number
    totalSize: number
    pageInfo: PageInfo
}

export interface Edge2 {
    cursor: string
    size: number
    node: Node2
}

export interface Node2 {
    color: string
    id: string
    name: string
}

export interface PageInfo {
    endCursor: string
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string
}
