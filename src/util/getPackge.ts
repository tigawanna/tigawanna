
export interface ViewerRepos {
    data: Data
}

export interface Data {
    viewer: Viewer
}

export interface Viewer {
    repositories: Repositories
}

export interface Repositories {
    totalCount: number
    nodes: Node[]
}

export interface Node {
    id: string
    name: string
    nameWithOwner: string
}



export async function getViewerRepos(){
const query = `
query {
  viewer {
    repositories(first:100,isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        id
        name
        nameWithOwner
      }
    }
  }
}

`
    return fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            //@ts-expect-error
            "Authorization": `bearer ${import.meta.env.RAKKAS_GH_PAT}`,
            "Content-Type": "application/json",
            "accept": "application/vnd.github.hawkgirl-preview+json"
        },
        body: JSON.stringify({
            query,
            // variables,
            // operationName,
        }),
    }).then(result => result.json() as unknown as ViewerRepos)
        .catch(err => {
            console.log("error fetching viewer repos  ==> ", err)
            throw err
        });
}

export async function getOwnerRepo(name: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${name}/repos`,{
        method: "GET",
        headers: {

        }
    });
    const data = await response.json();

    } catch (error) {
        console.log("error fetching owner/repo ",error)
        throw error
    }
}



export interface RepoPKGJSON {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    content: string;
    encoding: string;
    _links: Links;
}

export interface Links {
    self: string;
    git: string;
    html: string;
}


export async function getPackgeJson(owner_repo: string) {
   
    try {    
    const headersList = {
        //@ts-expect-error
        "Authorization": `bearer ${import.meta.env.RAKKAS_GH_PAT}`,
    }
    const response = await fetch(`https://api.github.com/repos/${owner_repo}/contents/package.json`, {
        method: "GET",
        headers: headersList
    });

    const data = await response.json();

    if(!data){
        return
    }
    // console.log("get pkg json data  ==== > ",data)
    if (data.message && data.documentation_url ){
        return  data    
    }


        if (data && data.encoding === "base64" && data.content){
        const pgkjson = JSON.parse(Buffer.from(data.content, data.encoding).toString())
        const dependancies = Object.entries(pgkjson.dependencies).map(([key, value]) => key + value)
        return dependancies
    }

  
   } 
   catch (error) {
        console.log("error fetching acakge.json ",error)
        return error
    }

}


export async function getAllReposPkgJson(){
    const repos = await getViewerRepos()
    const reposList = repos.data.viewer.repositories.nodes
    
    // const reposPkgJson = reposList.map((repo) => {
    //     // console.log("repo  === ",repo.nameWithOwner)
    //     // return await getPackgeJson(repo.nameWithOwner)
    //     return repo
    // })
    // console.log("reposPkgJson  === ",reposPkgJson)

    return reposList
    // return Promise.allSettled(reposPkgJson)
}

