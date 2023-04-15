export interface ViewerRepos {
    data: Data|BadDataGitHubError
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


export interface BadDataGitHubError {
    message: string
    documentation_url: string
}




// response from querying package.json of a repository
export interface RepoRawPKGJSON {
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
    _links: RepoRawPKGJSONLinks;
}

export interface RepoRawPKGJSONLinks {
    self: string;
    git: string;
    html: string;
}


export type KeyStringObject={[key: string]: string}

export interface RequiredDecodedPackageJson {
    name: string
    private: boolean
    version: string
    type: string
    scripts:KeyStringObject
    dependencies:KeyStringObject
    devDependencies: KeyStringObject
}

export type DecodedPackageJson = (RequiredDecodedPackageJson & {})|BadDataGitHubError
