import { createGitHubClient } from "@repo/github";

export async function deleteGithubRepo(token: string, fullName: string) {
  await createGitHubClient(token).deleteRepo(fullName);
}

export async function setGithubRepoVisibility(
  token: string,
  fullName: string,
  visibility: "public" | "private",
) {
  await createGitHubClient(token).setRepoVisibility(fullName, visibility);
}
