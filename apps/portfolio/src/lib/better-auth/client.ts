import { authAc, authRoles, userRoles, type BetterAuthUserRoles } from "@repo/auth";
import { apiKeyClient } from "@better-auth/api-key/client";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getAppUrl } from "@/lib/envs/client-env";

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
  plugins: [
    adminClient({
      ac: authAc,
      roles: authRoles,
    }),
    apiKeyClient(),
    emailOTPClient(),
  ],
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
export type BetterAuthUser = BetterAuthSession["user"];
export { userRoles, type BetterAuthUserRoles };
