import { createLogger } from "evlog";
import { useRequest } from "nitro/context";
import type { GithubGraphqlRateLimit } from "@repo/github";

export type GithubReposListLogEvent = {
  operation: "list-github-repos";
  callCount: number;
  first: number;
  repoCount: number;
  errorCount: number;
  durationMs: number;
  rateLimit: GithubGraphqlRateLimit | null;
};

let listGithubReposCallCount = 0;

/**
 * Increments and returns the process-lifetime call count for backstage repo listing.
 */
export function nextListGithubReposCallCount(): number {
  listGithubReposCallCount += 1;
  return listGithubReposCallCount;
}

/**
 * Returns the active HTTP request id when this code runs inside Nitro request scope.
 */
function getParentRequestId(): string | undefined {
  try {
    const req = useRequest();
    const requestLog = req.context?.log as
      | { getContext?: () => { requestId?: string } }
      | undefined;
    return requestLog?.getContext?.().requestId ?? (req.context?.requestId as string | undefined);
  } catch {
    return undefined;
  }
}

/**
 * Emits structured GitHub repos list telemetry as its own evlog wide event.
 *
 * Server functions can outlive the parent HTTP wide event (already sealed when
 * `log.set()` runs), so this uses `createLogger().emit()` instead of mutating
 * the request logger.
 *
 * @param event - Call metadata, pagination inputs, and GraphQL rate-limit fields.
 */
export function logGithubReposListEvent(event: GithubReposListLogEvent) {
  if (import.meta.env.DEV) {
    console.debug("[GitHub repos] listGithubReposForBackstage", event);
  }

  const log = createLogger({
    service: "tigawanna-site",
    operation: event.operation,
    githubRepos: event,
  });

  const parentRequestId = getParentRequestId();
  if (parentRequestId) {
    log.set({ _parentRequestId: parentRequestId });
  }

  log.emit();
}
