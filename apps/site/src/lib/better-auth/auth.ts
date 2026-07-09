import { account, apikey, deviceCode, session, user, verification } from "@repo/db";
import { authAc, authRoles } from "@repo/auth";
import { apiKey } from "@better-auth/api-key";
import { getDb } from "@/lib/db/get-db";
import { getServerEnv } from "@/lib/envs/server-env";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer, deviceAuthorization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const env = getServerEnv();
const baseURL = env.BETTER_AUTH_URL ?? env.VITE_APP_URL ?? "http://localhost:3044";
const deviceVerificationUri = new URL("/device", baseURL).toString();
const trustedOrigins = new Set<string>([baseURL]);
if (env.VITE_APP_URL) {
  trustedOrigins.add(env.VITE_APP_URL);
}
for (const origin of env.BETTER_AUTH_TRUSTED_ORIGINS ?? []) {
  trustedOrigins.add(origin);
}

function configuredAdminEmail() {
  return env.ADMIN_EMAIL.trim().toLowerCase();
}

/**
 * Better Auth instance for the TanStack Start site.
 */
export const auth = betterAuth({
  appName: "Tigawanna",
  secret: env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [...trustedOrigins],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: {
      user,
      session,
      account,
      verification,
      apikey,
      deviceCode,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (inputUser) => {
          const adminEmail = configuredAdminEmail();
          if (adminEmail && inputUser.email.toLowerCase() === adminEmail) {
            return { data: { ...inputUser, role: "admin" } };
          }
          return { data: inputUser };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const adminEmail = configuredAdminEmail();
      if (!adminEmail) {
        throw new APIError("FORBIDDEN", {
          message: "Sign up is disabled until ADMIN_EMAIL is configured",
        });
      }

      const body = ctx.body;
      const email =
        typeof body === "object" && body && "email" in body
          ? String((body as { email: string }).email).toLowerCase()
          : "";

      if (email !== adminEmail) {
        throw new APIError("FORBIDDEN", {
          message: "Sign up is limited to the configured admin email",
        });
      }
    }),
  },
  plugins: [
    apiKey({
      defaultPrefix: "tgw_",
      apiKeyHeaders: ["x-api-key", "authorization"],
      requireName: true,
      enableMetadata: true,
    }),
    bearer(),
    deviceAuthorization({ verificationUri: deviceVerificationUri, schema: {} }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      ac: authAc,
      roles: authRoles,
    }),
    tanstackStartCookies(),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = BetterAuthSession["user"];
