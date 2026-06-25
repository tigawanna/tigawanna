import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_AUTH_TOKEN: z.string(),
  FRONTEND_URL: z.string().url(),
  LMSTUDIO_BASE_URL: z.string().url().optional(),
  LMSTUDIO_MODEL: z.string().optional(),
});

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
  const formattedErrors = error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${formattedErrors}`);
}

export const serverEnv = data;
