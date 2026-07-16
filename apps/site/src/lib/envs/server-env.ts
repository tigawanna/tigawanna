import { DEFAULT_DATABASE_URL } from "@repo/db/constants";
import { z } from "zod";

/**
 * Parses a comma-separated list of trusted origins into a trimmed string array.
 */
function parseTrustedOrigins(raw: string | undefined) {
  if (!raw?.trim()) {
    return undefined;
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const serverEnvSchema = z.object({
  ADMIN_EMAIL: z.string().default(""),
  BETTER_AUTH_SECRET: z.string().default(""),
  BETTER_AUTH_URL: z.string().optional(),
  BETTER_AUTH_TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((raw) => parseTrustedOrigins(raw)),
  TELEGRAM_BOT_TOKEN: z.string().default(""),
  TELEGRAM_CHANNEL_ID: z.string().default(""),
  GH_PAT: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  DEV_TO_KEY: z.string().optional(),
  DATABASE_URL: z.string().default(DEFAULT_DATABASE_URL),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  VITE_APP_URL: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
