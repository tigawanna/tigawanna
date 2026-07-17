import { DEFAULT_POSTHOG_HOST } from "@/lib/posthog/constants";
import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_APP_URL: z.url().default("http://localhost:3045"),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.url().default(DEFAULT_POSTHOG_HOST),
});

export const clientEnv = clientEnvSchema.parse({
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
});

export function getAppUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return clientEnv.VITE_APP_URL;
}
