


export interface ViewerLang {
  data: ViewerLangData|ViewerLangError
}

export interface ViewerLangError {
  message: string
  documentation_url: string
}


export interface ViewerLangData {
  viewer: Viewer
}

export interface Viewer {
  repositories: Repositories
}

export interface Repositories {
  edges: Edge[]
  totalCount: number
}

export interface Edge {
  node: Node
}

export interface Node {
  id: string
  nameWithOwner: string
  languages: Languages
}

export interface Languages {
  edges: LanguageEdge[]
}

export interface LanguageEdge {
  node: LanguageNode
}

export interface LanguageNode {
  id: string
  name: string
  color: string
}



export async function getViewerLangs() {

const querr = `
{
  viewer {
    repositories(first: 100) {
      edges {
        node {
          id
          nameWithOwner
          languages(first: 10) {
            edges {
              node {
                id
                name
                color
              }
            }
          }
        }
      }
      totalCount
    }
  }
}
`;
    return fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
         "Authorization": `bearer ${import.meta.env.RAKKAS_GH_PAT}`,
            "Content-Type": "application/json",
            "accept":"application/vnd.github.hawkgirl-preview+json"
        },
        body: JSON.stringify({
            query: querr,
            // variables,
            // operationName,
        }),
    }).then(result => result.json())
    .catch(err => console.log("error fetching viewer langs",err));
}


