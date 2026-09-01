import { getAppUrl } from "@/lib/envs/client-env";
import { userRoles, type BetterAuthUserRoles } from "@repo/auth";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
  plugins: [],
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
export type BetterAuthUser = BetterAuthSession["user"];
export { userRoles, type BetterAuthUserRoles };
