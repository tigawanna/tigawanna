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
  GH_PAT: z.string().optional(),
  VITE_APP_URL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
