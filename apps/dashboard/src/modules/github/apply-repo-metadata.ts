import { createGitHubClient } from "@repo/github";

export async function applyRepoMetadata(
  token: string,
  fullName: string,
  input: {
    description: string;
    homepage?: string | null;
    topics: string[];
  },
) {
  await createGitHubClient(token).applyRepoMetadata(fullName, input);
}
