import { collectErrorMessages } from "@/utils/errors";

/**
 * Returns true when a GitHub repo delete failed due to missing admin token privileges.
 *
 * @param err - Error thrown by the delete mutation or server function.
 */
export function isGithubRepoDeletePermissionError(err: unknown): boolean {
  const haystack = collectErrorMessages(err).join(" ").toLowerCase();

  return (
    haystack.includes("403") ||
    haystack.includes("must have admin rights") ||
    haystack.includes("must have ad") ||
    haystack.includes("admin access") ||
    haystack.includes("resource not accessible by personal access token") ||
    haystack.includes("insufficient")
  );
}

/**
 * Handles a failed repo delete by opening the admin PAT dialog when appropriate.
 *
 * @param err - Rejected delete error.
 * @param onNeedsAdminPat - Called when the user should paste an admin-capable token.
 * @returns True when the error was handled as a permission issue.
 */
export function handleGithubRepoDeleteError(err: unknown, onNeedsAdminPat: () => void): boolean {
  if (!isGithubRepoDeletePermissionError(err)) {
    return false;
  }

  onNeedsAdminPat();
  return true;
}
