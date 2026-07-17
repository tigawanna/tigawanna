import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_APP_URL: z.url().default("http://localhost:3046"),
});

export const clientEnv = clientEnvSchema.parse({
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
});

export function getAppUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return clientEnv.VITE_APP_URL;
}
