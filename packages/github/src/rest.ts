export async function githubRest<T>(token: string, path: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub REST ${path} failed: ${res.status} ${body}`);
  }

  return (await res.json()) as T;
}
