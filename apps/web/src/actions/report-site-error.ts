"use server";

import { headers } from "next/headers";
import { siteConfig } from "@repo/site-constants";
import { z } from "zod";
import { resolveApproximateLocation } from "@/lib/geo/approximate-location";
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
 * True only for real production deploys — never local `next dev` / `next start` or Vercel previews.
 */
function shouldSendSiteErrorAlerts(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (/localhost|127\.0\.0\.1/i.test(siteUrl)) return false;

  return true;
}

/**
 * Formats a critical frontend error for Telegram delivery.
 * Request metadata is limited to an approximate location (no IP).
 */
function formatSiteErrorTelegramMessage(
  data: ReportSiteErrorInput,
  meta: { approximateLocation?: string; userAgent?: string },
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
    `Approx. location: ${meta.approximateLocation ?? "unknown"}`,
  ];

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
 * No-ops in development, Vercel previews, and localhost production previews.
 */
export async function reportSiteError(input: ReportSiteErrorInput) {
  if (!shouldSendSiteErrorAlerts()) {
    return { sent: false as const };
  }

  const data = reportSiteErrorSchema.parse(input);
  const requestHeaders = await headers();
  const location = await resolveApproximateLocation(requestHeaders);
  const approximateLocation = location?.label;
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  const telegram = getTelegramClient();
  if (!telegram) {
    return { sent: false as const };
  }

  try {
    const result = await telegram.send(
      formatSiteErrorTelegramMessage(data, { approximateLocation, userAgent }),
    );
    return { sent: result.success };
  } catch {
    return { sent: false as const };
  }
}
