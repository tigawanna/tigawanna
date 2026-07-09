import { getTelegramClient } from "@/lib/telegram/client";
import { AppConfig } from "@/utils/system";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

const TELEGRAM_MESSAGE_LIMIT = 4096;

const reportSiteErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  pathname: z.string(),
  fingerprint: z.string(),
});

export type ReportSiteErrorInput = z.infer<typeof reportSiteErrorSchema>;

function truncateTelegramMessage(text: string) {
  if (text.length <= TELEGRAM_MESSAGE_LIMIT) {
    return text;
  }

  return `${text.slice(0, TELEGRAM_MESSAGE_LIMIT - 24)}\n\n...(truncated)`;
}

function formatSiteErrorTelegramMessage(
  data: ReportSiteErrorInput,
  meta: { ipAddress?: string; userAgent?: string },
) {
  const lines = [
    "Site critical error",
    "",
    `Site: ${AppConfig.links.website}`,
    `Route: ${data.pathname}`,
    `Time: ${new Date().toISOString()}`,
    "",
    `Error: ${data.name}`,
    `Message: ${data.message}`,
  ];

  if (meta.ipAddress) {
    lines.push(`IP: ${meta.ipAddress}`);
  }

  if (meta.userAgent) {
    lines.push(`User-Agent: ${meta.userAgent}`);
  }

  if (data.stack) {
    lines.push("", "Stack:", data.stack);
  }

  return truncateTelegramMessage(lines.join("\n"));
}

export const reportSiteError = createServerFn({ method: "POST" })
  .validator((input: ReportSiteErrorInput) => reportSiteErrorSchema.parse(input))
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const ipAddress =
      headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for") ?? undefined;
    const userAgent = headers.get("user-agent") ?? undefined;

    try {
      const result = await getTelegramClient().send(
        formatSiteErrorTelegramMessage(data, { ipAddress, userAgent }),
      );

      return { sent: result.success };
    } catch {
      return { sent: false };
    }
  });
