import { BadDataGitHubError, DecodedPackageJson, ViewerRepos } from "./types";


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
            const pgkjson = JSON.parse(Buffer.from(data.content, data.encoding).toString())
            return pgkjson as DecodedPackageJson
        }

        throw data


    }
    catch (error) {
        console.log("error fetching package.json >>>>>>>>>>>>  ", error)
        throw error
    }

}



export async function getAllReposPkgJson() {
    const repos = await getViewerRepos();
    if ("viewer" in repos.data) {
        const reposList = repos.data.viewer.repositories.nodes;
        const reposPkgJson = reposList.map(async (repo) => {
            try {
                const pkgjson = await getRepoPackageJson(repo.nameWithOwner);
                if (pkgjson)
                    return pkgjson
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
    owner?: string;
    repo?: string;
    path?: string;
    message?: string;

}

export async function savePackageJsonsToRepo({
    owner="tigawanna",
    repo="tigawanna",
    path = "user_packages.json",
    message = "update user_packages.json list"
}: ISavePackageJsonsToRepo) {

  const user_pkgjsons = await getAllReposPkgJson()
  const content = JSON.stringify(user_pkgjsons);

   return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/vnd.github+json',
            // @ts-expect-error
            'Authorization': `token ${import.meta.env.RAKKAS_GH_PAT}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            content: Buffer.from(content).toString('base64')
        })
    })
        .then(response => response.json())
        .then(data => {
        console.log("successfully saved user-package.json to repo",data)
        return data
        })
        .catch(error => {
            console.error("error saving package json to repo",error)
            throw error
        });



}





