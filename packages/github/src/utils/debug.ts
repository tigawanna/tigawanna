declare const process: { env?: Record<string, string | undefined> };

/**
 * Returns true when GitHub repo fetch debug logging is enabled.
 *
 * Set `GITHUB_REPOS_DEBUG=true` in the server environment.
 */
export function isGithubReposDebugEnabled() {
  return typeof process !== "undefined" && process.env?.GITHUB_REPOS_DEBUG === "true";
}

/**
 * Logs GitHub repo fetch diagnostics when `GITHUB_REPOS_DEBUG=true`.
 */
export function logGithubReposDebug(message: string, payload?: unknown) {
  if (!isGithubReposDebugEnabled()) {
    return;
  }

  if (payload === undefined) {
    console.log(`[github repos] ${message}`);
    return;
  }

  console.log(`[github repos] ${message}`, payload);
}
