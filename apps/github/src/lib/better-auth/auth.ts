import { getBaseUrl } from "@/config/url";
import { getServerEnv } from "@/lib/envs/server-env";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const env = getServerEnv();
const baseURL = getBaseUrl();

const trustedOrigins = new Set<string>([baseURL]);
if (env.VITE_APP_URL) {
  trustedOrigins.add(env.VITE_APP_URL);
}
for (const origin of env.BETTER_AUTH_TRUSTED_ORIGINS ?? []) {
  trustedOrigins.add(origin);
}

/**
 * Better Auth instance for the GitHub dashboard app.
 */
export const auth = betterAuth({
  appName: "GitHub Dashboard",
  secret: env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [...trustedOrigins],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [bearer(), tanstackStartCookies()],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = BetterAuthSession["user"];
