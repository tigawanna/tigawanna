import type { TelegramClientConfig, TelegramSendOptions, TelegramSendResult } from "./types.js";

const TELEGRAM_API_BASE = "https://api.telegram.org";

/**
 * Creates a Telegram Bot API client for sending channel notifications.
 */
export function createTelegramClient(config: TelegramClientConfig) {
  return new TelegramClient(config);
}

/**
 * Thin Telegram Bot API client focused on notification delivery.
 *
 * Credentials are injected by the caller — this package does not read env vars.
 */
export class TelegramClient {
  private readonly apiUrl: string;
  private readonly channelId: string;

  constructor(config: TelegramClientConfig) {
    const botToken = config.botToken.trim();
    const channelId = config.channelId.trim();

    if (!botToken) {
      throw new Error("Telegram bot token must be provided");
    }
    if (!channelId) {
      throw new Error("Telegram channel ID must be provided");
    }

    this.channelId = channelId;
    this.apiUrl = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;
  }

  /**
   * Sends a plain-text (or optionally formatted) message to the configured channel.
   */
  async send(message: string, options: TelegramSendOptions = {}): Promise<TelegramSendResult> {
    const { disableWebPagePreview = true, parseMode } = options;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.channelId,
          text: message,
          disable_web_page_preview: disableWebPagePreview,
          ...(parseMode ? { parse_mode: parseMode } : {}),
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Telegram API responded with status ${response.status}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        message: "Message sent successfully",
        statusCode: 200,
      };
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Error sending message: ${detail}`,
        statusCode: 500,
      };
    }
  }
}
