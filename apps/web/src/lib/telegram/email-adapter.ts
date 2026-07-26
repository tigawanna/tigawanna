import type { EmailAdapter, SendEmailOptions } from "payload";

import { getTelegramClient } from "@/lib/telegram/client";
import { truncateTelegramMessage } from "@/lib/telegram/format";

/**
 * Stringifies Payload/Nodemailer `to` into a comma-separated address list.
 */
function stringifyToAddress(to: SendEmailOptions["to"]): string {
  if (typeof to === "string") {
    return to;
  }

  if (Array.isArray(to)) {
    return to
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }
        return entry.address ?? "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (to && typeof to === "object" && "address" in to) {
    return to.address ?? "";
  }

  return "";
}

/**
 * Extracts a plain-text body from a Payload email message (prefers `text`, else strips `html`).
 * Preserves anchor `href`s so password-reset links survive HTML → Telegram conversion.
 */
function extractPlainBody(message: SendEmailOptions): string {
  if (typeof message.text === "string" && message.text.trim().length > 0) {
    return message.text.trim();
  }

  if (typeof message.html === "string" && message.html.trim().length > 0) {
    return message.html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, label) => {
        const text = String(label)
          .replace(/<[^>]+>/g, "")
          .trim();
        const url = String(href).trim();
        if (!url) return text;
        if (!text || text === url) return url;
        return `${text}\n${url}`;
      })
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return "";
}

/**
 * Formats a Payload email payload as a Telegram notification.
 */
function formatEmailForTelegram(message: SendEmailOptions): string {
  const to = stringifyToAddress(message.to);
  const subject = typeof message.subject === "string" ? message.subject : "(no subject)";
  const body = extractPlainBody(message);

  const lines = ["Payload email", "", `To: ${to || "(unknown)"}`, `Subject: ${subject}`, ""];

  if (body) {
    lines.push(body);
  }

  return truncateTelegramMessage(lines.join("\n"));
}

/**
 * Payload email adapter that relays every `sendEmail` call to Telegram.
 * No SMTP/Resend provider required — uses `TELEGRAM_BOT_TOKEN` + channel id env.
 */
export const telegramEmailAdapter: EmailAdapter<{ sent: boolean }> = ({ payload }) => ({
  name: "telegram",
  defaultFromAddress: "noreply@tigawanna.local",
  defaultFromName: "Tigawanna",
  sendEmail: async (message) => {
    const telegram = getTelegramClient();
    const to = stringifyToAddress(message.to);
    const subject = typeof message.subject === "string" ? message.subject : "(no subject)";
    const hasText = typeof message.text === "string" && message.text.trim().length > 0;
    const hasHtml = typeof message.html === "string" && message.html.trim().length > 0;

    payload.logger.info({
      msg: "Payload email send requested",
      to,
      subject,
      hasText,
      hasHtml,
      telegramConfigured: Boolean(telegram),
    });

    if (!telegram) {
      payload.logger.warn({
        msg: `Email skipped (Telegram unset). To: '${to}', Subject: '${subject}'`,
      });
      return { sent: false };
    }

    const formatted = formatEmailForTelegram(message);
    payload.logger.info({
      msg: "Relaying email to Telegram",
      preview: formatted.slice(0, 280),
    });

    const result = await telegram.send(formatted);

    if (!result.success) {
      payload.logger.error({
        msg: `Telegram email relay failed. To: '${to}', Subject: '${subject}': ${result.message}`,
      });
      throw new Error(result.message);
    }

    payload.logger.info({
      msg: `Email relayed to Telegram. To: '${to}', Subject: '${subject}'`,
    });

    return { sent: true };
  },
});
