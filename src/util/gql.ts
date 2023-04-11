
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
            "Authorization": "bearer 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",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: querr,
            // variables,
            // operationName,
        }),
    }).then(result => result.json()).catch(err => console.log("error fetching viewer langs",err));
}


