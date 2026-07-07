import { createGitHubClient } from "@repo/github";

const client = createGitHubClient(process.env.GITHUB_TOKEN!);

const repos = await client.getRepoTree("octocat", "demo", "main");

console.log({ repos });
