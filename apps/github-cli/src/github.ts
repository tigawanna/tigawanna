import { Octokit } from "@octokit/rest";
import type { ActionResult, GitHubRepo } from "./types.js";

function mapRepo(repo: {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  visibility?: string;
  description: string | null;
  updated_at: string | null;
}): GitHubRepo {
  const visibility =
    repo.visibility === "public" || repo.visibility === "private" || repo.visibility === "internal"
      ? repo.visibility
      : repo.private
        ? "private"
        : "public";

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    visibility,
    description: repo.description,
    updatedAt: repo.updated_at ?? "",
  };
}

export function createGitHubClient(token: string): Octokit {
  return new Octokit({ auth: token });
}

export async function fetchAllRepos(octokit: Octokit): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: "updated",
      direction: "desc",
      affiliation: "owner,collaborator,organization_member",
    });

    if (data.length === 0) {
      break;
    }

    repos.push(...data.map(mapRepo));
    if (data.length < 100) {
      break;
    }
    page += 1;
  }

  return repos;
}

export async function deleteRepo(octokit: Octokit, repo: GitHubRepo): Promise<void> {
  await octokit.repos.delete({
    owner: repo.owner,
    repo: repo.name,
  });
}

export async function setRepoVisibility(
  octokit: Octokit,
  repo: GitHubRepo,
  visibility: "public" | "private",
): Promise<void> {
  await octokit.repos.update({
    owner: repo.owner,
    repo: repo.name,
    private: visibility === "private",
    visibility,
  });
}

export async function runBulkAction(
  octokit: Octokit,
  repos: GitHubRepo[],
  action: "delete" | "public" | "private",
): Promise<ActionResult[]> {
  const results: ActionResult[] = [];

  for (const repo of repos) {
    try {
      if (action === "delete") {
        await deleteRepo(octokit, repo);
      } else {
        await setRepoVisibility(octokit, repo, action);
      }
      results.push({ repo, ok: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ repo, ok: false, error: message });
    }
  }

  return results;
}
