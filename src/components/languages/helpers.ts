


export interface ViewerLang {
    data: ViewerLangData | ViewerLangError
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
            "accept": "application/vnd.github.hawkgirl-preview+json"
        },
        body: JSON.stringify({
            query: querr,
            // variables,
            // operationName,
        }),
    }).then(result => result.json())
        .catch(err => {
            console.log("error fetching viewer langs", err)
            return err
        }
        );
}




export interface LanguagePercentage {
    name: string;
    color: string;
    percentage: number;
}

export function getMostFrequentLanguages(repositories: Repositories): LanguagePercentage[] {
    type LanguageCount = { [key: string]: { count: number, color: string } }
    const languageCount: LanguageCount = {};
    const langsArr = repositories.edges.flatMap((edge) => edge.node.languages.edges)
    langsArr.forEach((lang) => {
        const languageName = lang.node.name;
        // console.log("item === ", languageCount[languageName])
        if (languageCount[languageName] && languageCount[languageName]['count']) {
            languageCount[languageName] = {
                count: languageCount[languageName]['count'] + 1,
                color: lang.node.color
            }
        } else {
            languageCount[languageName] = {
                count: 1,
                color: lang.node.color
            };
        }
    })

    languageCount["HTL+CSS+Javascript/Typescript"] = {
        count: languageCount['HTML'].count + languageCount['CSS'].count + languageCount['JavaScript'].count + languageCount['TypeScript'].count,
        color: "#fd0cfd"
    }



    // console.log("languageCount",languageCount)

    delete languageCount["HTML"]
    delete languageCount["CSS"]
    delete languageCount["JavaScript"]
    delete languageCount["TypeScript"]

    const langsTotalCount = Object.values(languageCount).reduce((a, b) => a + b.count, 0);
    // console.log("languagesCount",languageCount)

    return Object.entries(languageCount).map(([key, value]) => {
        return {
            name: key,
            color: value.color,
            percentage: parseInt(((value.count / langsTotalCount) * 100).toFixed(2))
        }
    }).sort((a, b) => b.percentage - a.percentage);

    // console.log("langs  Percentage === ",langsPercentage)

}
