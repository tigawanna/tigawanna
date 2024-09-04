export function fetcherGraphQL<T>(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>,
) {
  return fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GH_PAT}`,
    },
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    }),
  }).then((result) => result.json() as T);
}
