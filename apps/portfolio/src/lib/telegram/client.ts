import { createTelegramClient } from "@repo/telegram";
import { getServerEnv } from "@/lib/envs/server-env";

/**
 * Builds a Telegram notification client from server env credentials.
 */
export function getTelegramClient() {
  const env = getServerEnv();
  return createTelegramClient({
    botToken: env.TELEGRAM_BOT_TOKEN,
    channelId: env.TELEGRAM_CHANNEL_ID,
  });
}

export {
  createTelegramClient,
  TelegramClient,
  type TelegramClientConfig,
  type TelegramSendOptions,
  type TelegramSendResult,
} from "@repo/telegram";
