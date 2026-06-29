import type { TViewer } from "@/data-access-layer/auth/viewer";
import type { ServerEnv } from "@/lib/envs/server-env";

function isTruthy(value: string | undefined) {
  return value === "true";
}

type AuthBypassEnv = Pick<ServerEnv, "BYPASS_AUTH"> & {
  VITE_BYPASS_AUTH?: string;
};

/**
 * Returns whether server-side auth checks should be skipped.
 *
 * Intended for local development only. Reads `BYPASS_AUTH` and `VITE_BYPASS_AUTH`
 * from the provided env object and from `process.env`.
 *
 * @param env - Optional server env snapshot; falls back to `process.env` flags.
 * @returns `true` when any bypass flag is set to the string `"true"`.
 */
export function isAuthBypassEnabledOnServer(env?: AuthBypassEnv) {
  return (
    isTruthy(env?.BYPASS_AUTH) ||
    isTruthy(env?.VITE_BYPASS_AUTH) ||
    isTruthy(process.env.BYPASS_AUTH) ||
    isTruthy(process.env.VITE_BYPASS_AUTH)
  );
}

/**
 * Type guard for an authenticated backstage viewer.
 *
 * @param viewer - Viewer from router context or {@link viewerqueryOptions}.
 * @returns `true` when the viewer represents a signed-in admin.
 */
export function isAdminUser(viewer: TViewer | undefined) {
  return viewer?.isAdmin === true;
}
