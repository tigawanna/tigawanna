import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getAppUrl } from "@/lib/client-env";

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
  basePath: "/api/auth",
  plugins: [adminClient()],
});

export type BetterAuthSession = typeof authClient.$Infer.Session;
