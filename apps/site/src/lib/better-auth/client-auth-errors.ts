import { parseError } from "evlog";

const PUBLIC_AUTH_DENIAL_MESSAGE = "Rate limit exceeded. Try again later.";

/**
 * Reads an HTTP status from a Better Auth client error payload when present.
 */
function authClientErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const status = (error as { status: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

/**
 * Formats backstage sign-in errors for display. Production hides auth guard details.
 */
export function backstageAuthErrorDescription(error: unknown) {
  const status = authClientErrorStatus(error);
  if (!import.meta.env.DEV && (status === 403 || status === 429)) {
    return PUBLIC_AUTH_DENIAL_MESSAGE;
  }

  const { message, why, fix } = parseError(error);
  return [why, fix].filter(Boolean).join(" ") || message;
}
