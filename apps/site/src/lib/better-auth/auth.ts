import { account, apikey, deviceCode, session, user, verification } from "@repo/db";
import { authAc, authRoles } from "@repo/auth";
import { apiKey } from "@better-auth/api-key";
import { getDb } from "@/lib/db/get-db.server";
import { getServerEnv } from "@/lib/envs/server-env";
import { sendOtpViaTelegram } from "@/lib/better-auth/send-otp-telegram";
import { rejectBackstageAuth } from "@/lib/better-auth/guard-admin-auth";
import { createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer, deviceAuthorization, emailOTP } from "better-auth/plugins";
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

const ADMIN_AUTH_PATHS = new Set([
  "/sign-up/email",
  "/email-otp/send-verification-otp",
  "/sign-in/email-otp",
]);

/**
 * Returns the configured admin email in lowercase, or an empty string when unset.
 */
function configuredAdminEmail() {
  return env.ADMIN_EMAIL.trim().toLowerCase();
}

/**
 * Reads an email field from a Better Auth request body when present.
 */
function emailFromBody(body: unknown) {
  if (typeof body !== "object" || body === null || !("email" in body)) {
    return "";
  }
  return String((body as { email: string }).email).toLowerCase();
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
      if (!ADMIN_AUTH_PATHS.has(ctx.path)) {
        return;
      }

      const adminEmail = configuredAdminEmail();
      if (!adminEmail) {
        rejectBackstageAuth("Admin auth is disabled until ADMIN_EMAIL is configured");
      }

      const email = emailFromBody(ctx.body);
      if (email !== adminEmail) {
        rejectBackstageAuth("Auth is limited to the configured admin email");
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
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 5,
      disableSignUp: false,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        const adminEmail = configuredAdminEmail();
        if (!adminEmail || email.toLowerCase() !== adminEmail) {
          return;
        }
        // Do not await — Better Auth recommends this to avoid timing attacks.
        sendOtpViaTelegram({ email, otp, type });
      },
    }),
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
