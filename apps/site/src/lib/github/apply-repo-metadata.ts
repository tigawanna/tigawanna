export async function applyRepoMetadata(
  token: string,
  fullName: string,
  input: {
    description: string;
    homepage?: string | null;
    topics: string[];
  },
) {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repository full name");
  }

  const patchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: input.description,
      homepage: input.homepage || null,
    }),
  });

  if (!patchRes.ok) {
    const body = await patchRes.text();
    throw new Error(`Failed to update repository metadata: ${patchRes.status} ${body}`);
  }

  const topicsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github.mercy-preview+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ names: input.topics }),
  });

  if (!topicsRes.ok) {
    const body = await topicsRes.text();
    throw new Error(`Failed to update repository topics: ${topicsRes.status} ${body}`);
  }
}
