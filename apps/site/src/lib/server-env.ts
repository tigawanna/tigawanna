import { DEFAULT_DATABASE_URL } from "@repo/db";

export type ServerEnv = {
  ADMIN_EMAIL: string;
  ADMIN_SESSION_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHANNEL_ID: string;
  GH_PAT?: string;
  DEV_TO_KEY?: string;
  PB_URL?: string;
  BYPASS_AUTH?: string;
  DATABASE_URL: string;
  DATABASE_AUTH_TOKEN?: string;
};

export function getServerEnv(): ServerEnv {
  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID ?? "",
    GH_PAT: process.env.GH_PAT,
    DEV_TO_KEY: process.env.DEV_TO_KEY,
    PB_URL: process.env.PB_URL,
    BYPASS_AUTH: process.env.BYPASS_AUTH,
    DATABASE_URL: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  };
}
