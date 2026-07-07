import { Octokit, RequestError } from "octokit";
import {
  ENRICHMENT_RECENT_REPOS_QUERY,
  ONE_REPO_QUERY,
  PINNED_REPOS_QUERY,
  RECENT_REPOS_QUERY,
  REPO_BY_NAME_QUERY,
} from "./graphql/queries.js";
import type {
  EnrichmentRecentReposGraphqlResponse,
  OneRepoGraphqlResponse,
  PinnedReposGraphqlResponse,
  RecentReposGraphqlResponse,
  RepoByNameGraphqlResponse,
} from "./graphql/response-types.js";
import type {
  FetchRecentReposOptions,
  FetchRecentReposResult,
  GithubGraphqlError,
  GithubRepoSnapshot,
} from "./types.js";
import { filterRepoNodes, mapEnrichmentRepoNode, splitRepoFullName } from "./utils/repo.js";

type GraphqlResult<T> = T & {
  errors?: GithubGraphqlError[];
};

type GraphqlRequestOptions = {
  cache?: RequestCache;
  variables?: Record<string, unknown>;
};

/**
 * Creates a GitHub API client backed by Octokit (REST + GraphQL).
 */
export function createGitHubClient(token: string) {
  return new GitHubClient(token);
}

/**
 * Centralized GitHub API client for REST and GraphQL operations.
 */
export class GitHubClient {
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Runs a typed GitHub GraphQL query.
   */
  async graphql<T>(query: string, options: GraphqlRequestOptions = {}): Promise<GraphqlResult<T>> {
    const { cache, variables } = options;
    return this.octokit.graphql<GraphqlResult<T>>(query, {
      ...variables,
      request: cache ? { cache } : undefined,
    });
  }

  /**
   * Fetches the viewer's pinned repositories.
   */
  async getPinnedRepos() {
    const result = await this.graphql<PinnedReposGraphqlResponse>(PINNED_REPOS_QUERY);
    return filterRepoNodes(result.viewer.pinnedItems.nodes);
  }

  /**
   * Fetches the viewer's recent repositories with optional sort and cache controls.
   */
  async getRecentRepos(options: FetchRecentReposOptions = {}): Promise<FetchRecentReposResult> {
    const {
      first = 100,
      isFork = false,
      orderField = "PUSHED_AT",
      orderDirection = "DESC",
      cache = "no-store",
    } = options;

    const result = await this.graphql<RecentReposGraphqlResponse>(RECENT_REPOS_QUERY, {
      cache,
      variables: { first, isFork, orderField, orderDirection },
    });

    const nodes = filterRepoNodes(result.viewer.repositories.nodes);

    return {
      data: {
        viewer: {
          pinnedItems: { nodes: [] },
          repositories: { nodes },
        },
      },
      errors: result.errors ?? [],
    };
  }

  /**
   * Fetches recent public repositories for indexing.
   */
  async getRecentReposForIndexing() {
    const result = await this.graphql<RecentReposGraphqlResponse>(RECENT_REPOS_QUERY, {
      variables: {
        first: 100,
        isFork: false,
        orderField: "PUSHED_AT",
        orderDirection: "DESC",
      },
    });

    return filterRepoNodes(result.viewer.repositories.nodes, { excludePrivate: true });
  }

  /**
   * Fetches a single repository with languages and topics.
   */
  async getRepoDetail(owner: string, repo: string) {
    const result = await this.graphql<OneRepoGraphqlResponse>(ONE_REPO_QUERY, {
      variables: { owner, repo, firstTopics: 10, firstLangs: 10 },
    });
    return result.repository;
  }

  /**
   * Fetches recent repositories for enrichment workflows.
   */
  async getRecentRepoSnapshots(limit: number) {
    const result = await this.graphql<EnrichmentRecentReposGraphqlResponse>(
      ENRICHMENT_RECENT_REPOS_QUERY,
      { variables: { first: limit } },
    );

    return filterRepoNodes(result.viewer.repositories.nodes, { excludePrivate: true }).map(
      mapEnrichmentRepoNode,
    );
  }

  /**
   * Fetches repository snapshots by `owner/repo` full names.
   */
  async getRepoSnapshotsByFullNames(fullNames: string[]) {
    const repos: GithubRepoSnapshot[] = [];

    for (const fullName of fullNames) {
      const [owner, name] = fullName.split("/");
      if (!owner || !name) {
        continue;
      }

      const result = await this.graphql<RepoByNameGraphqlResponse>(REPO_BY_NAME_QUERY, {
        variables: { owner, name },
      });

      const node = result.repository;
      if (node && !node.isPrivate) {
        repos.push(mapEnrichmentRepoNode(node));
      }
    }

    return repos;
  }

  /**
   * Returns a recursive git tree for a repository branch.
   */
  async getRepoTree(owner: string, repo: string, branch: string, recursive = true) {
    try {
      const response = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: recursive ? "1" : undefined,
      });
      return response.data.tree;
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Returns decoded file content from a repository path, or null when missing.
   */
  async getRepoFileContent(owner: string, repo: string, path: string, ref: string) {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (Array.isArray(response.data) || response.data.type !== "file") {
        return null;
      }

      if (response.data.encoding !== "base64" || !response.data.content) {
        return null;
      }

      return decodeBase64Content(response.data.content);
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Deletes a repository by `owner/repo` full name.
   */
  async deleteRepo(fullName: string) {
    const { owner, repo } = splitRepoFullName(fullName);
    await this.octokit.rest.repos.delete({ owner, repo });
  }

  /**
   * Updates repository visibility between public and private.
   */
  async setRepoVisibility(fullName: string, visibility: "public" | "private") {
    const { owner, repo } = splitRepoFullName(fullName);
    await this.octokit.rest.repos.update({
      owner,
      repo,
      private: visibility === "private",
      visibility,
    });
  }

  /**
   * Updates repository description, homepage, and topics.
   */
  async applyRepoMetadata(
    fullName: string,
    input: {
      description: string;
      homepage?: string | null;
      topics: string[];
    },
  ) {
    const { owner, repo } = splitRepoFullName(fullName);

    await this.octokit.rest.repos.update({
      owner,
      repo,
      description: input.description,
      homepage: input.homepage || undefined,
    });

    await this.octokit.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: input.topics,
    });
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof RequestError && error.status === 404;
}

/**
 * Decodes a base64 GitHub file content payload to UTF-8 text.
 */
function decodeBase64Content(content: string) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(content.replace(/\n/g, "")), (character) => character.charCodeAt(0)),
  );
}

export { RequestError };
