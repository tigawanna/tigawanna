
export async function getViewerLangs() {
    const querr = `
{
  viewer {
    repositories(first: 100) {
      edges {
        node {
          id
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
    return fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            //@ts-expect-error
            "Authorization": `bearer ${import.meta.env.VITE_GH_PAT}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: querr,
            // variables,
            // operationName,
        }),
    }).then(result => result.json()).catch(err => console.log("error fetching viewer langs",err));
}


