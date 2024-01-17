## Intro

Are developers engineers? Maybe not in the strictest sense, but sometimes we like to geek out and over-engineer things, especially when it comes to our own portfolios.

Portfolio websites are the perfect playground for unleashing our creativity and showcasing our skills without worrying about going overboard. In this mini-series, we'll be transforming our  [portfolio site](https://tigawanna-portfolio.vercel.app/) 
into an expressive masterpiece that truly reflects who we are as developers.


To begin, we'll lay the groundwork with our signature color scheme and a hero section featuring a striking image of ourselves. Get ready to dive into the world of code and design as we breathe life into our digital canvas!


![site hero section](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/q98jelwjetzaaoqcy59n.png)




Next, we'll unveil a curated showcase of our most impressive projects, seamlessly integrated into the site. While hardcoding them is an option, we'll opt for a more dynamic approach by fetching them directly from our GitHub repository. This ensures our portfolio always reflects our latest and greatest creations.

But why stop at a simple project list when we can paint a richer portrait of our coding prowess? Let's infuse the site with captivating programming language statistics, revealing the languages we've mastered and the depths of our expertise. While pre-built solutions like  [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) 
that we can embed directly into our markdown or html ,
It's limitation is that it'll only fetch the first 100 repos.

```ts
const fetcher = (variables, token) => {
  return request(
    {
      query: `
      query userInfo($login: String!) {
        user(login: $login) {
          # fetch only owner repos & not forks
          repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
            nodes {
              name
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    color
                    name
                  }
                }
              }
            }
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `token ${token}`,
    },
  );
};
```

This is good enough but in my case I have at least 200 (i plan to delete most of these as soon as I fix up [another tool](https://github.com/tigawanna/repo-manager) for that 😜)
 
So I made a recursive version of it to fetch all our repositories

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
then we'll loop over these with .reduce and output the languages stats and return an array of type 

```ts
const top_langs: {
    name: string;
    color: string;
    percentage: number;
}[] | undefined
```

```tsx

import { LanguagePercentage } from "./helpers";

interface GithubLangiagesProps {
  top_langs: LanguagePercentage[];

}

export function GithubLangiagesPercentage({top_langs}:GithubLangiagesProps){

if(!top_langs){
  return null
}

return (
  <div className="w-full h-full  flex items-center py-2 ">
    <div className="w-full h-full">
      <ul className="w-full flex flex-wrap  list-none m-0 px-5 gap-3  ">
        {top_langs.map(({color,name,percentage}, index: number) => {
          const percent = percentage
          const percetage = percent < 5 ? percent + 2 : percent;
          if(percentage<1){
            return null
          }
          return (
            <li
              key={name + index}
              className=" md:max-w-[70%] min-w-fit gap-1 flex flex-col justify-center "
              style={{
                width: `${percetage}%`,
              }}>
              <div
                className="min-w-[20%]  rounded-xl w-full h-4"
                style={{
                  backgroundColor: color ?? "",
                }}>
                
              </div>
              <div className="pl-1 text-xs flex min-w-fit gap-2">
                <div>{name}</div>
                <div> {percentage}%</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);
}
```
finally we display the stats bars
```tsx
export async function GithubLanguages({}: LanguagesProps) {
  const top_langs = await getGithubViewerLanguages();
  if (!top_langs) return;

  return (
    <div
      className=" w-full  h-full   p-5 
        flex flex-wrap items-center justify-center text-xs md:text-base
        gap-2  rounded-xl ">
      <SectionHeader heading="Languages Stats on Github" id="stats" />
    <GithubLangiagesPercentage top_langs={top_langs} />
    </div>
  );
}
```
![programming languages stats](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7xlu1mh86rjwxzl75nyc.png)
[](https://tigawanna-portfolio.vercel.app/#stats)


In the next part we fix react's biggest problem: the lack of a cool ".react" file extension like Vue or svelte , because how else are people going to know what all that html,CSS and JavaScript was being used for



