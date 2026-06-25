import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_AI_LOCAL_MODE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

const { success, error, data } = envSchema.safeParse(import.meta.env);

if (!success) {
  const formattedErrors = error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${formattedErrors}`);
}

export const clientEnv = data;

export const isAiLocalMode = clientEnv.VITE_AI_LOCAL_MODE === true;
