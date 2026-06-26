import type { TViewer } from "@/data-access-layer/auth/viewer";
import type { ServerEnv } from "@/lib/server-env";

function isTruthy(value: string | undefined) {
  return value === "true";
}

type AuthBypassEnv = Pick<ServerEnv, "BYPASS_AUTH"> & {
  VITE_BYPASS_AUTH?: string;
};

export function isAuthBypassEnabledOnServer(env?: AuthBypassEnv) {
  return (
    isTruthy(env?.BYPASS_AUTH) ||
    isTruthy(env?.VITE_BYPASS_AUTH) ||
    isTruthy(process.env.BYPASS_AUTH) ||
    isTruthy(process.env.VITE_BYPASS_AUTH)
  );
}

export function isAdminUser(viewer: TViewer | undefined) {
  return viewer?.isAdmin === true;
}
