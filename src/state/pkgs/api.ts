import { logNormal } from "../../util/general";


export interface IPkgJsons {
    _id: string;
    repo_names: string[];
    top_favdeps: string[];
}

export async function getFavDeps(viewer_token:string){
    const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Authorization": `Bearer ${viewer_token}`,
    }
try {
    const res = await fetch('https://mongo-project.onrender.com/github', {
        method: "GET",
        headers: headersList
    })
    const data = await res.json() as IPkgJsons[]
    logNormal("favdeps",res.status)
    return data 
} catch (error) {
    return error as IPkgJsons[]
}
}
