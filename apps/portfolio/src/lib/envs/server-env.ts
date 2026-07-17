import { DEFAULT_DATABASE_URL } from "@repo/db/constants";
import { z } from "zod";

const serverEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().default(""),
  TELEGRAM_CHANNEL_ID: z.string().default(""),
  GH_PAT: z.string().optional(),
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
