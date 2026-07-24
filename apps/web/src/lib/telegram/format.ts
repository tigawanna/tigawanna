const TELEGRAM_MESSAGE_LIMIT = 4096;

/**
 * Truncates a Telegram message to the Bot API text limit.
 */
export function truncateTelegramMessage(text: string) {
  if (text.length <= TELEGRAM_MESSAGE_LIMIT) {
    return text;
  }

  return `${text.slice(0, TELEGRAM_MESSAGE_LIMIT - 24)}\n\n...(truncated)`;
}
