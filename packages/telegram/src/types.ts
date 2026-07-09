/**
 * Credentials required to talk to the Telegram Bot API.
 */
export type TelegramClientConfig = {
  botToken: string;
  /** Channel username (`@channel`) or numeric chat ID. */
  channelId: string;
};

/**
 * Result of a `sendMessage` attempt against the Telegram Bot API.
 */
export type TelegramSendResult = {
  success: boolean;
  message: string;
  statusCode: number;
};

/**
 * Optional overrides for a single `sendMessage` call.
 */
export type TelegramSendOptions = {
  /**
   * When true (default), link previews are disabled.
   */
  disableWebPagePreview?: boolean;
  /**
   * Telegram parse mode. Omit for plain text.
   */
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
};
