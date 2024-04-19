interface FetchGQLProps {
	operationsDoc: string;
	headers?: Record<string, string>;
	operationName?: string;
	variables?: Record<string, any>;
}
export async function fetchGraphQL({
	operationsDoc,
	operationName,
	variables,
	headers,
}: FetchGQLProps) {
	try {
		const result = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers,
			body: JSON.stringify({
				query: operationsDoc,
				variables: variables,
				operationName: operationName,
			}),
		});
		if (!result.ok) {
			throw new Error(result.statusText);
		}
		return await result.json();
	} catch (error) {
		throw error;
	}
}
