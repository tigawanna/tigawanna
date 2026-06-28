import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "apps/site/.env"),
  resolve(process.cwd(), "../site/.env"),
];

export type CliEnv = {
  ghPat: string;
  databaseUrl: string;
  databaseAuthToken?: string;
  openrouterApiKey?: string;
  openrouterModel: string;
  gemmaModelPath?: string;
};

export function loadEnv() {
  for (const path of envCandidates) {
    if (existsSync(path)) {
      dotenv.config({ path });
      return path;
    }
  }

  dotenv.config();
  return null;
}

export function getCliEnv(): CliEnv {
  const ghPat = process.env.GH_PAT ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const databaseUrl = process.env.DATABASE_URL;

  if (!ghPat) {
    throw new Error("GH_PAT (or GITHUB_TOKEN / GH_TOKEN) is required");
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return {
    ghPat,
    databaseUrl,
    databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
    gemmaModelPath: process.env.GEMMA_MODEL_PATH,
  };
}

export function logEnvSummary(env: CliEnv) {
  const dbHost = env.databaseUrl.replace(/^libsql:\/\//, "").split("/")[0] ?? env.databaseUrl;
  console.log(`[env] database=${dbHost}`);
  console.log(`[env] openrouter=${env.openrouterApiKey ? env.openrouterModel : "disabled (no API key)"}`);
  console.log(`[env] gemma=${env.gemmaModelPath ?? "default HuggingFace model"}`);
}
