function splitFullName(fullName: string) {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repository full name");
  }
  return { owner, repo };
}

function githubHeaders(token: string, init?: HeadersInit) {
  const headers = new Headers(init);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  return headers;
}

export async function deleteGithubRepo(token: string, fullName: string) {
  const { owner, repo } = splitFullName(fullName);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "DELETE",
    headers: githubHeaders(token),
  });

  if (res.status !== 204 && !res.ok) {
    const body = await res.text();
    throw new Error(`Failed to delete repository: ${res.status} ${body}`);
  }
}

export async function setGithubRepoVisibility(
  token: string,
  fullName: string,
  visibility: "public" | "private",
) {
  const { owner, repo } = splitFullName(fullName);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: githubHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      private: visibility === "private",
      visibility,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update repository visibility: ${res.status} ${body}`);
  }
}
