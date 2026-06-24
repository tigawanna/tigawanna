Vue and svelte people can't relate to this one as their framework have their own extensions which makes them show up as languages in Github .

To list how many projects we've used react, Solid or Preact in , we'll need to check that `package.json` in our Github 

first let's create a helper that will determine how we group the libraries

```ts
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
``` 

now let's setup a function to fetch the `package.json` for a repository

```ts 
// get repository package.json
// # TODO : check the repository language and early return if it's // not JS or TS
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

```
The function will also try to check if the repository is a Deno project by checking for a `deno.json` if it can't find a `package.json` 

The base64 encoder can vary between runtimes , the one below works on Deno
```ts
function base64ToUint8Array(base64: string): Uint8Array {
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
```

once we get our `package.json` , we can now modify it before saving it in a DB for future reference to avoid doing this step too often and grinding up against Github's rate limits.

```ts
//  modify package.json to addthe pkg_type
export function modifyPackageJson(pgkjson: DecodedPackageJson) {
  if ("name" in pgkjson) {
    const typeCondition = pkgTypeCondition(pgkjson);
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

```



And with that all we need is to run our [recursive repo fetcher](https://gist.github.com/tigawanna/3ae4b14f2820c50f5b3d993c4f8773c6) and for every item execute this function


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


> ⚠ **Warning:** This method will hit the Github API limit very quickly and you might get timed out.
Deno queues could help at this by staggering the requests [example with Deno queues](https://github.com/tigawanna/library-stats/blob/4569d944082d5f0bb8bfe74e19bba6f5b3a93d7e/routes/stats/helpers/computeLibStats.ts)
 writing the response to a DB is probably a good idea so that we don't have to run this every time 

> ℹ️ **Info:** the Deno queues are not working on deploy only locally , where you'll have to write to a remote KV deployed on deploy .
If anyone knows how to make that Deno queue work in deploy let me know I haven't been successful with that

Now we can display them on sour site , but wait , mapping over the items and displaying a simple list looks a little not over engineered , so let's fix that



we'll be copying from the TanStack website sponsors section where they had this cool visualization of circles that vary in size based on how big a contributor they are.


![Tanstack website visualization](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/95to9jw5052vt2upxwv3.png)



We'll be using [VLSX](https://airbnb.io/visx/docs) by the people at Airbnb

```sh
npm i @visx/hierarchy @visx/responsive 
```

In my case , my  data will be in this shape

```ts
export interface ViewerLibraries {
  highlighted_library_stats: Record<string, string>;
  library_stats: Record<string, string>;
  framework_stats: Record<string, string>;
}
```

and we'll

```tsx
  const languages = Object.entries(libs?.highlighted_library_stats ?? {})
  .map(([key, value]) => ({
    key,
    value,
  }));

// initialize the pack
  const pack = React.useMemo(
    () => ({
      children: languages,
      name: "root",
      radius: 0,
      distance: 0,
    }),
    [languages]
  );

//  initialize the root
  const root = React.useMemo(
    () =>
      hierarchy(pack)
        // d:{key:string;value:number}
        .sum((d: any) => {
          // // no("sum", d?.tier?.monthlyPriceInDollars)
          return 1 + d?.value;
        })
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    [pack]
  );

```

Then we'll map over the items to display them in our components.

```tsx


    <div className="w-full h-full flex flex-col items-center gap-2 pt-2">
      <div className="w-full">
        <ParentSize>
          {({ width = 600 }) => {
            return width < 10 ? null : (
              <div
                style={{
                  width,
                  height: width,
                  position: "relative",
                }}>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `

              .spon-link {
                transition: all .2s ease;
                transform: translate(-50%, -50%);
              }

              .spon-link:hover {
                z-index: 10;
                transform: translate(-50%, -50%) scale(1.1);
              }

              .spon-link:hover .spon-tooltip {
                opacity: 1;
              }
            `,
                  }}
                />
                <Pack root={root} size={[width, width]} padding={width * 0.005}>
                  {(packData) => {
                    // // no(" ===== PACK DATA ======= ", packData);
                    const circles = packData.descendants().slice(1); // skip first layer
                    // // no("========= CIRCLES DESCENDANT ======== ", circles);
                    return (
                      <div>
                        {[...circles].reverse().map((circ, i) => {
                          const circle = circ as any as Circle;
                          const tooltipX = circle.x > width / 2 ? "left" : "right";
                          const tooltipY = circle.y > width / 2 ? "top" : "bottom";

                          return (
                            <a
                              key={`circle-${i}`}
                              href={`https://github.com/${circle.data.key}`}
                              className={
                                `spon-link ` + `absolute shadow-lg bg-white rounded-full z-0`
                              }
                              style={{
                                left: circle.x,
                                top: circle.y,
                                width: circle.r * 2,
                                height: circle.r * 2,
                              }}>
                              <img
                                key={`circle-${i}`}
                                className={`absolute bg-no-repeat bg-center bg-contain rounded-full
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%]
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
                                src={`https://avatars0.githubusercontent.com/${
                                  circle.data.key
                                }?v=3&s=${Math.round(circle.r * 2)}`}
                              />
                              <div
                                className={twMerge(
                                  `spon-tooltip absolute text-sm
                              bg-gray-800 text-white p-2 pointer-events-none
                              transform opacity-0
                              shadow-xl rounded-lg
                              flex flex-col items-center
                            `,

                                  tooltipX == "left"
                                    ? `left-1/4 -translate-x-full`
                                    : `right-1/4 translate-x-full`,
                                  tooltipY == "top"
                                    ? `top-1/4 -translate-y-full`
                                    : `bottom-1/4 translate-y-full`
                                )}>
                                <p className={`whitespace-nowrap font-bold`}>{circle.data.key}</p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    );
                  }}
                </Pack>
              </div>
            );
          }}
        </ParentSize>
      </div>
    </div>

```

ℹ️ **Info:** the library types are a little off so we hade to typecast to the correct ones 


![Visualizations with VLSX](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xgmyrghbi7s197swd4nw.png)

A little issue that might need some future over engineering is getting the correct libraries logos , the technique am currently using relies on the repository name matching the NPM package name which isn't always the case  

```ts
               src={`https://avatars0.githubusercontent.com/${
                                  circle.data.key
                                }?v=3&s=${Math.round(circle.r * 2)}`}
``` 
A more reliable solution might be to search the repository and save it's open-graph image in in the augment package JSON step.

That's enough over engineering for a day.

In the next part we'll adding a contact me form using NextJS server actions and try to make as progressively enhancable as possible

