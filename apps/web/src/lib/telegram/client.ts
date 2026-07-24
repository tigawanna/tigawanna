import { createTelegramClient, type TelegramClient } from "@repo/telegram";

/**
 * Resolves Telegram credentials from env.
 * Prefers `TELEGRAM_CHANNEL_ID` (site / monorepo), falls back to legacy `TELEGRAM_CHAT_ID`.
 */
function resolveTelegramCredentials(): { botToken: string; channelId: string } | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const channelId =
    process.env.TELEGRAM_CHANNEL_ID?.trim() || process.env.TELEGRAM_CHAT_ID?.trim() || "";

  if (!botToken || !channelId) {
    return null;
  }

  return { botToken, channelId };
}

/**
 * Builds a Telegram notification client when credentials are configured.
 * Returns null when env is unset so local/dev can still persist contact messages.
 */
export function getTelegramClient(): TelegramClient | null {
  const credentials = resolveTelegramCredentials();
  if (!credentials) {
    return null;
  }

  return createTelegramClient(credentials);
}

export {
  createTelegramClient,
  TelegramClient,
  type TelegramClientConfig,
  type TelegramSendOptions,
  type TelegramSendResult,
} from "@repo/telegram";
