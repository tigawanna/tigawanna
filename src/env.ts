import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  EMAIL_FROM: z.string().email(),
  EMAIL_TO: z.string().email(),
  BREVO_KEY: z.string().min(12),
  
  GH_PAT: z.string().min(12),
  MESSAGE_API_URL: z.string().url(),
  MESSAGE_API_KEY: z.string().min(12),
  DENO_URL: z.string().url(),
  DEV_TO_KEY: z.string().min(12),
  PB_URL: z.string().url(),
});

export type TEnv = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  // return
}

const envVariables = env!;
export { envVariables };
