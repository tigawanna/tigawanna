import { DecodedPackageJson, RequiredDecodedPackageJson, TPkgType, ViewerRepos } from "./types";


export async function getViewerRepos() {
    const query = `
    query($first: Int!) {
    viewer {
    repositories(first:$first,isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
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
            variables: {
                first: 50
            },
            // operationName,
        }),
    }).then(result => result.json() as unknown as ViewerRepos)
        .catch(err => {
            console.log("error fetching viewer repos  ==> ", err)
            return err as ViewerRepos
        });
}



async function modifyPackageJson(pgkjson: DecodedPackageJson) {
 
    if("name" in pgkjson) {
        pgkjson['pkg_type'] = pkgTypeCondition(pgkjson).pkg_type
        const alldeps = Object.keys(pgkjson.dependencies).map((key) => {
            return key.split('^')[0]
        }).concat(
            Object.keys(pgkjson.devDependencies).map((key) => {
                return key.split('^')[0]
            })
        )
        pgkjson['alldeps'] = alldeps

        console.log("parsed pkgjson >>>>>>>>>>>>  ", pgkjson)
        return pgkjson

    }
    return pgkjson
}



export async function getRepoPackageJson(owner_repo: string) {
    try {
        const headersList = {
            //@ts-expect-error
            "Authorization": `bearer ${import.meta.env.RAKKAS_GH_PAT}`,
        }
        const response = await fetch(`https://api.github.com/repos/${owner_repo}/contents/package.json`, {
            method: "GET",
            headers: headersList
        });
      
        const data = await response.json()
        if (data && data.encoding === "base64" && data.content) {
             const pgkjson = await JSON.parse(Buffer.from(data.content, data.encoding).toString()) as DecodedPackageJson
             return await modifyPackageJson(pgkjson)
        // return pgkjson
        }
       
    }
    catch (error) {
        console.log("error fetching package.json >>>>>>>>>>>>  ", error)
        throw error
    }

}


export function pkgTypeCondition(pkg: RequiredDecodedPackageJson): {
    pkg_type: TPkgType;
    condition: boolean;
} {

    if (pkg.devDependencies?.vite && pkg.devDependencies["@vitejs/plugin-react"]) {
        return { pkg_type: "React+Vite", condition: true }
    }
    if (pkg.dependencies?.react && pkg.dependencies?.relay) {
        return { pkg_type: "React+Relay", condition: true }
    }
    if (pkg.devDependencies?.rakkasjs) {
        return { pkg_type: "Rakkasjs", condition: true }
    }

    if (pkg.dependencies?.next) {
        return { pkg_type: "Nextjs", condition: true }
    }
    if ((pkg.devDependencies?.nodemon || pkg.dependencies?.nodemon || pkg.dependancies?.express)) {
        return { pkg_type: "Nodejs", condition: true }
    }
    return { pkg_type: "Others", condition: false }
}




export async function getAllReposPkgJson() {
    const repos = await getViewerRepos();
    if ("viewer" in repos.data) {
        const reposList = repos.data.viewer.repositories.nodes;
        const reposPkgJson = reposList.map(async (repo) => {
            try {
                const pkgjson = await getRepoPackageJson(repo.nameWithOwner);
                if (pkgjson){
                    return pkgjson
                }
            } catch (error) {
                console.log("error fetching list of  package.jsons >>>>>>>>>>> ", error);
                throw error;
            }
        });
        return (await Promise.allSettled(reposPkgJson))
            .filter((x) => x.status === "fulfilled")
    }
}



interface ISavePackageJsonsToRepo {
    owner: string;
    repo: string;
    path: string;
    message: string;

}

interface IGetSha{
    owner: string;
    repo: string;
    path: string;
}

export async function getfileSha({owner,repo,path,}:IGetSha){
  return  fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
        .then(response => response.json())
        .then(data => {
            const sha = data.sha
            console.log("sha ==== ",sha)
            return sha
        }).catch(error => {
            console.log("error getting file sha", error)
            throw error
        })
}

export async function savePackageJsonsToRepo({owner,repo,path,message}: ISavePackageJsonsToRepo) {

    try{
        const sha = await getfileSha({ owner, repo, path })
        const user_pkgjsons = await getAllReposPkgJson()

        const pkg_jsons_to_save = user_pkgjsons?.map((pkgjson) => {
            // @ts-expect-error
            return pkgjson.value
        })?.filter((pkgjson) => {
            return pkgjson
        })
        const content = JSON.stringify(pkg_jsons_to_save, null, 2);
         const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/vnd.github+json',
                // @ts-expect-error
                'Authorization': `token ${import.meta.env.RAKKAS_GH_PAT}`,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                message,
                content: Buffer.from(content).toString('base64'),
                sha
            })
        })
        const data = await res.json()
        return { data, pkg_jsons_to_save }
     


    }catch(error){
        console.log("error saving user-package.json to repo",error)
    }
 

}





