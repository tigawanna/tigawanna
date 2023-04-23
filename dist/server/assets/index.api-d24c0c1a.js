import { json } from "@hattip/response";
async function getViewerLangs() {
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
  return fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `bearer ${"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"}`,
      "Content-Type": "application/json",
      "accept": "application/vnd.github.hawkgirl-preview+json"
    },
    body: JSON.stringify({
      query: querr
      // variables,
      // operationName,
    })
  }).then((result) => result.json()).catch((err) => console.log("error fetching viewer langs", err));
}
function get() {
  return json({ hello: getViewerLangs() });
}
export {
  get
};
