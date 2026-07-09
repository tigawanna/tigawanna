import { APIError } from "better-auth/api";

const PUBLIC_AUTH_DENIAL_MESSAGE = "Rate limit exceeded. Try again later.";

/**
 * Whether backstage auth should return detailed denial reasons to the client.
 */
export function isBackstageAuthDebugMode() {
  return process.env.NODE_ENV === "development";
}

/**
 * Rejects a backstage auth attempt. In production, responds as rate-limited so
 * callers cannot infer admin-only restrictions.
 */
export function rejectBackstageAuth(reason: string) {
  if (isBackstageAuthDebugMode()) {
    throw new APIError("FORBIDDEN", { message: reason });
  }

  throw new APIError("TOO_MANY_REQUESTS", {
    message: PUBLIC_AUTH_DENIAL_MESSAGE,
  });
}
