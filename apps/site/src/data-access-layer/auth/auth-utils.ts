function isTruthy(value: string | undefined) {
  return value === "true";
}

type AuthBypassEnv = Pick<CloudflareBindings, "BYPASS_AUTH"> & {
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

export function isAdminUser(user: { role?: string | null } | undefined) {
  if (!user?.role) return false;
  return user.role
    .split(",")
    .map((role) => role.trim())
    .includes("admin");
}
