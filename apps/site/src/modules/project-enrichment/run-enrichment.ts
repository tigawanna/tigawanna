import type { GithubRepoSnapshot } from "./github-client";
import { syncRepoSnapshot } from "./sync-repo-snapshot";

export {
  createRunRecord,
  updateRunFailure,
  updateRunProgress,
  updateRunSuccess,
} from "./run-records";

/**
 * Upserts a repo snapshot for import flows (attendance derived from metadata).
 */
export async function importRepoSnapshot(repo: GithubRepoSnapshot) {
  await syncRepoSnapshot(repo);
}
