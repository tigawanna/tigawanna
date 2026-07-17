const GH_ADMIN_PAT_STORAGE_KEY = "backstage:github-admin-pat";

/**
 * Reads a GitHub admin PAT stored in the browser for repo deletion retries.
 *
 * @returns The stored token, or null when absent or unavailable.
 */
export function getStoredGithubAdminPat(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(GH_ADMIN_PAT_STORAGE_KEY);
}

/**
 * Persists a GitHub admin PAT in browser local storage only.
 *
 * @param pat - Personal access token with admin repo privileges.
 */
export function setStoredGithubAdminPat(pat: string): void {
  localStorage.setItem(GH_ADMIN_PAT_STORAGE_KEY, pat.trim());
}

/**
 * Removes the stored GitHub admin PAT from browser local storage.
 */
export function clearStoredGithubAdminPat(): void {
  localStorage.removeItem(GH_ADMIN_PAT_STORAGE_KEY);
}
