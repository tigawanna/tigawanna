
# Aggregating libraries,frameworks and languages used on github
The github API doesn't give us a way to get our most used languagesor libraries so we'll have to get craetive, 

First we'll need to fetch all our repos and get their languages and then we'll aggregate them.

but the Github API has a response limit of 100 items at a time , i had over 200 repos , so i made  recusive function to get all the repositories

We'll be using the graphql API which will return each repositories languages too withour have to fetch them separately.

code to fetch the viewer's repos

```ts
export async function getViewerRepos(
  viewer_token: string,
  cursor: string | null = null,
): Promise<{ data: ViewerRepos | null; error: BadDataGitHubError | null }> {

  const query = `
    query($first: Int!,$after: String) {
    viewer {
    repositories(      
     first: $first
      after: $after
      isFork: false
      orderBy: {field: PUSHED_AT, direction: DESC}
      ) {

      edges {
        node {
          id
          name
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
      pageInfo {
        endCursor
        startCursor
      }
    }
  }
}
`;
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${viewer_token}`,
        "Content-Type": "application/json",
        "accept": "application/vnd.github.hawkgirl-preview+json",
      },
      body: JSON.stringify({
        query,
        variables: {
          first: 50,
          after: cursor,
        },
        // operationName,
      }),
    });
    const data = await response.json() as unknown as ViewerRepos;

    if ("message" in data) {
      console.log("throw error fetching viewer repos  ==> ", data);
      return { data: null, error: data as unknown as BadDataGitHubError };
    }
    // logSuccess("all user repositories ===== ", data);
    return { data, error: null };
  } catch (err) {
    console.log("catch error fetching viewer repos ==> ", err);
    return { data: null, error: err as BadDataGitHubError };
  }
}

export interface ViewerRepos {
  data: Data;
}

export interface Data {
  viewer: Viewer;
}

export interface Viewer {
  repositories: Repositories;
}

export interface Repositories {
  edges: Edge[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface Edge {
  cursor: string;
  node: Node;
}

export interface Node {
  id: string;
  name: string;
  nameWithOwner: string;
  languages: Languages;
}

export interface Languages {
  edges: LanguageEdge[];
}

export interface LanguageEdge {
  node: LanguageNode;
}

export interface LanguageNode {
  id: string;
  name: string;
  color: string;
}

export interface PageInfo {
  endCursor: string;
  startCursor: string;
}

export interface BadDataGitHubError {
  message: string;
  documentation_url: string;
}

```

recursively fetch all the repos 
```ts
async function fetchReposRecursivelyWithGQL({
  viewer_token,
  all_repos = [],
  cursor,
}: FetchRepoRecursivelyWithGQL) {
  try {
    const repos = await getViewerRepos(viewer_token, cursor);
    if (repos.data) {
      const fetched_repos = repos.data.data.viewer.repositories.edges;
      const totalCount = repos.data.data.viewer.repositories.totalCount;
      const next_cursor =
        repos.data.data.viewer.repositories.pageInfo.endCursor;
      const new_repos = all_repos.concat(fetched_repos);

      console.log({
        fetched_repos_count: new_repos.length,
        totalCount,
        next_cursor,
      });

      if (new_repos.length < totalCount) {
        return fetchReposRecursivelyWithGQL({
          viewer_token,
          cursor: next_cursor,
          all_repos: new_repos,
        });
      }
      return new_repos;
    }
  } catch (error) {
    logError(error);
  }
}


```

then we loop through those and get the languaes used .

as for the libraries and pachkages  we/ll need to grab each item's `package.json` using this snippet

```ts
// deno-lint-ignore-file no-explicit-any ban-ts-comment

import { logError } from "../helpers.ts";
import { getViewerRepos, LanguageEdge } from "./getViewerRepos.ts";

export function pkgTypeCondition(pkg: RequiredDecodedPackageJson): {
  pkg_type: TPkgType;
  condition: boolean;
} {
  const pkgs_string = JSON.stringify({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  });
  if (pkgs_string.includes("rakkas")) {
    return { pkg_type: "Rakkasjs", condition: true };
  }
  if (pkgs_string.includes("react-native")) {
    return { pkg_type: "React-native", condition: true };
  }

  if (pkg.dependencies?.next) {
    return { pkg_type: "Nextjs", condition: true };
  }

  if (pkg.dependencies?.react && pkg.dependencies?.["react-relay"]) {
    return { pkg_type: "React+Relay", condition: true };
  }

  if (pkg.devDependencies?.vite && pkg.dependencies?.react) {
    return { pkg_type: "React+Vite", condition: true };
  }

  if (
    pkgs_string.includes("nodemon") ||
    pkgs_string.includes("tsup") ||
    pkgs_string.includes("fastify") ||
    pkgs_string.includes("express") ||
    pkgs_string.includes("nestjs") ||
    pkgs_string.includes("mongoose")
  ) {
    return { pkg_type: "Nodejs", condition: true };
  }
  return { pkg_type: "Others", condition: false };
}

export function createPkgObject(pkg: DecodedPackageJson) {
  //@ts-expect-error
  const pkgtypeObj: { [key in (typeof pkgTypesArr)[number]]: any } = {};
  if ("name" in pkg) {
    pkgTypesArr.map((key: any) => {
      //@ts-expect-error
      pkgtypeObj[key] = {
        name: "",
        dependencies: pkg.dependencies,
        devDependencies: new Set(),
        count: 0,
      };
    });
  }
}

export const mostFaveDepsList = [
  "tailwind",
  "panda",
  "vite",
  "trpc",
  "expo",
  "react-native",
  "relay",
  "supabase",
  "typescript",
  "react-router-dom",
  "react-icons",
  "tanastck",
  "material",
  "mantine",
 
  "zustand",
  "shadcn",
  "ark",
  "grapgql",
  "redux",
  "date-fns",
  "react-hook-form",
  "firebase",
  "dayjs",
  "react",
  "hono",
  "axios",

  "pocketbase",
  "react-to-print",
  "react-query",
  "rollup",
  "express",
  "graphql",
  "jest",
  "vitest",
  "nodemon",
  "@tanstack"
];

//  modify package.json to addthe pkg_type
export function modifyPackageJson(pgkjson: DecodedPackageJson) {
  if ("name" in pgkjson) {
    const typeCondition = pkgTypeCondition(pgkjson);
    console.log("typeCondition", typeCondition);
    pgkjson["pkg_type"] = typeCondition.pkg_type;

    const alldeps = Object.keys(pgkjson.dependencies)
      .map((key) => {
        return key.split("^")[0];
      })
      .concat(
        Object.keys(pgkjson.devDependencies).map((key) => {
          return key.split("^")[0];
        }),
      );

    const favdeps = mostFaveDepsList.filter((key) => {
      return alldeps.find((dep) => {
        return dep.includes(key);
      });
    });

    pgkjson["favdeps"] = favdeps;
    return pgkjson;
  }
  return pgkjson;
}

// get repository package.json
export async function getOneRepoPackageJson(
  owner_repo: string,
  viewer_token: string,
) {
  try {
    const headersList = {
      Authorization: `bearer ${viewer_token}`,
      Accept: "application/vnd.github+json",
    };
    // is nodejs based
    const response = await fetch(
      `https://api.github.com/repos/${owner_repo}/contents/package.json`,
      {
        method: "GET",
        headers: headersList,
      },
    );

    const data = await response.json();
    // console.log("package.json data ==== ", data);

    if (data && data.encoding === "base64" && data.content) {
      const stringBuffer = new TextDecoder().decode(
        base64ToUint8Array(data.content),
      );
      const pkgjson = JSON.parse(stringBuffer) as DecodedPackageJson;
      return await modifyPackageJson(pkgjson);
    }

    const deno_lock_response = await fetch(
      `https://api.github.com/repos/${owner_repo}/contents/deno.lock`,
      {
        method: "GET",
        headers: headersList,
      },
    );
    const deno_lock_data = await deno_lock_response.json();

    if (
      !("documentation_url" in deno_lock_data && "message" in deno_lock_data)
    ) {
      return {
        name: owner_repo.split("/")[1],
        favdeps: ["deno"],
        dependencies: { deno: "latest" },
        pkg_type: "Deno",
      } as any as DecodedPackageJson;
    }
    const deno_json_response = await fetch(
      `https://api.github.com/repos/${owner_repo}/contents/deno.json`,
      {
        method: "GET",
        headers: headersList,
      },
    );
    const deno_json_data = await deno_json_response.json();

    if (
      !("documentation_url" in deno_json_data && "message" in deno_json_data)
    ) {
      return {
        name: owner_repo.split("/")[1],
        favdeps: ["deno"],
        dependencies: { deno: "latest" },
        pkg_type: "Deno",
      } as any as DecodedPackageJson;
    }

    const bun_lock_response = await fetch(
      `https://api.github.com/repos/${owner_repo}/contents/bun.lock`,
      {
        method: "GET",
        headers: headersList,
      },
    );
    const bun_lock_data = await bun_lock_response.json();
    if (!("documentation_url" in bun_lock_data && "message" in bun_lock_data)) {
      return {
        name: owner_repo.split("/")[1],
        favdeps: ["bun"],
        dependencies: { bun: "latest" },
        pkg_type: "Bun",
      } as any as DecodedPackageJson;
    }

    return data as DecodedPackageJson;
  } catch (error) {
    logError("error getOneRepoPackageJson >>>>>>>>>>>> ", error);
    return error as DecodedPackageJson;
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export async function computeAllPkgJsons(viewer_token: string) {
  try {
    const all_repos = await getViewerRepos(viewer_token);

    if (all_repos && "message" in all_repos) {
      logError("error loading  viewer repos  ==> ", all_repos);
      throw new Error("error loading  viewer repos : " + all_repos.message);
    }

    const reposPkgJson: DecodedPackageJson[] = [];

    if (all_repos.data?.data) {
      const reposList = all_repos.data?.data.viewer.repositories.edges;
      for await (const repo of reposList) {
        const pkgjson = await getOneRepoPackageJson(
          repo.node.nameWithOwner,
          viewer_token,
        );
        if ("message" in pkgjson && "documentation_url" in pkgjson) {
          continue;
        }
        if (pkgjson) {
          pkgjson.languages = repo.node.languages.edges;
          reposPkgJson.push(pkgjson);
        }
      }
    }
    return reposPkgJson;
  } catch (err) {
    throw err;
  }
}

export interface BadDataGitHubError {
  message: string;
  documentation_url: string;
}

export interface IPkgRepo {
  id: string;
  name: string;
  nameWithOwner: string;
}

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

export type KeyStringObject = { [key: string]: string };

export interface RequiredDecodedPackageJson {
  name: string;
  private?: boolean;
  version: string;
  type?: string;
  scripts: KeyStringObject;
  dependencies: KeyStringObject;
  devDependencies: KeyStringObject;
  [key: string]: any | undefined;
}

export type DecodedPackageJson =
  | (RequiredDecodedPackageJson & {
    nameWithOwner: string;
    favdeps?: string[];
    pkg_type?: TPkgType;
    languages?: LanguageEdge[];
  })
  | BadDataGitHubError;

export type PlainDecodedPackageJson = RequiredDecodedPackageJson & {
  favdeps: string[];
  pkg_type: TPkgType;
};
export type DecodedPackageJsonList = RequiredDecodedPackageJson;

export type DepsComBo =
  | "React + Vite"
  | "React"
  | "Vite"
  | "Rakkasjs"
  | "Nextjs"
  | "Nodejs"
  | "Deno"
  | "Bun";

export interface Packageinfo {
  name: string;
  version: string;
  type?: string;
  scripts: Record<string, string> | undefined;
  dependencies: Record<string, string> | undefined;
  devDependencies: Record<string, string> | undefined;
}

export interface TPkgObjValue {
  name: string;
  dependencies: Set<string>;
  // devDependencies:string[]
  count: number;
}

export type TPkgObjs = { [key in DepsComBo]: TPkgObjValue };

export type TPkgType =
  | "React+Vite"
  | "React+Relay"
  | "Rakkasjs"
  | "Nextjs"
  | "Nodejs"
  | "Deno"
  | "React-native"
  | "Bun"
  | "Others";

export const pkgTypesArr = [
  "React+Vite",
  "React+Relay",
  "React-native",
  "Rakkasjs",
  "Nextjs",
  "Nodejs",
  "Deno",
  "Bun",
  "Others",
] as const;

export type TPkgTypeObj = {
  [key in (typeof pkgTypesArr)[number]]: {
    name: string | null;
    dependencies: string[];
    count: number;
  };
};

export interface PkgsRequest extends Request {
  pkgs?: IPkgRepo[];
  pkg_jsons?: DecodedPackageJson[];
}

```


and using that we'll loop over all our items and call 

```ts
const viewer_token"ghp_0Bw5w5H5e8u7v9wjVBw5w5H5e8uw7W1e3z5n2vZr4P6qPq";
    const repos = await fetchReposRecursivelyWithGQL({
      viewer_token: gh_token,
    });
    const reposPkgJson: DecodedPackageJson[] = [];

    if (all_repos.data?.data) {
      const reposList = all_repos.data?.data.viewer.repositories.edges;
      for await (const repo of reposList) {
        const pkgjson = await getOneRepoPackageJson(
          repo.node.nameWithOwner,
          viewer_token,
        );
        if ("message" in pkgjson && "documentation_url" in pkgjson) {
          continue;
        }
        if (pkgjson) {
          pkgjson.languages = repo.node.languages.edges;
          reposPkgJson.push(pkgjson);
        }
      }
    }
    return reposPkgJson;
```

> ⚠ **Warning:** This method will hit the github api limit very quickly and you might get timed out.
Deno queues could help at this by staggering the requests [example with deno queues](https://github.com/tigawanna/library-stats/blob/4569d944082d5f0bb8bfe74e19bba6f5b3a93d7e/routes/stats/helpers/computeLibStats.ts)
 writing the reponses to a db is probably a good idea so that we don't have to run this everytime 

> ℹ️ **Info:** the deno queues are not working on deploy only locally , where you'll have to write to a remote kv depployed on deploy .
If anyone knows how to make that deno queue work in deploy let me know i haven't been successful with that
