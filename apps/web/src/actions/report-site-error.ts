"use server";

import { headers } from "next/headers";
import { siteConfig } from "@repo/site-constants";
import { z } from "zod";
import { getTelegramClient } from "@/lib/telegram/client";
import { truncateTelegramMessage } from "@/lib/telegram/format";

const reportSiteErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  pathname: z.string(),
  fingerprint: z.string(),
});

export type ReportSiteErrorInput = z.infer<typeof reportSiteErrorSchema>;

/**
 * Formats a critical frontend error for Telegram delivery.
 */
function formatSiteErrorTelegramMessage(
  data: ReportSiteErrorInput,
  meta: { ipAddress?: string; userAgent?: string },
) {
  const lines = [
    "Site critical error (web)",
    "",
    `Site: ${siteConfig.links.website}`,
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

/**
 * Sends a production critical-error alert to Telegram (best-effort; never throws to the client).
 */
export async function reportSiteError(input: ReportSiteErrorInput) {
  const data = reportSiteErrorSchema.parse(input);
  const requestHeaders = await headers();
  const ipAddress =
    requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for") ?? undefined;
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  const telegram = getTelegramClient();
  if (!telegram) {
    return { sent: false as const };
  }

  try {
    const result = await telegram.send(
      formatSiteErrorTelegramMessage(data, { ipAddress, userAgent }),
    );
    return { sent: result.success };
  } catch {
    return { sent: false as const };
  }
}
