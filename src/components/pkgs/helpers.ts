
export interface IPkgJsons {
    _id: string;
    repo_names: string[];
    top_favdeps: string[];
}

export interface IPkgJsonsError{
    error:{
        message:string;
        documentation_url:string;
    }
}
export async function getFavDeps(viewer_token:string){
    const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "authorization": `Bearer ${viewer_token}`,
    }
try {
    const res = await fetch('https://mongo-project.onrender.com/github', {
        method: "GET",
        headers: headersList
    })
    const data = await res.json() 
    if(data&&data?.error){
        throw data 
    }
    // logNormal("favdeps",res.status)
    // logSuccess("data === ",data)
    return data as IPkgJsons[]
} catch (error) {
    return error as IPkgJsonsError
}
}
