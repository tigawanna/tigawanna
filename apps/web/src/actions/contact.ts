"use server";

import { headers } from "next/headers";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/components/landing/sections/contact/contact-schema";

/**
 * Persists / relays a portfolio contact submission.
 * Telegram is optional for the experiment — always validates + logs.
 */
export async function sendContactMessage(input: ContactFormValues) {
  const data = contactFormSchema.parse(input);
  const hasContact = Boolean(data.contact && data.contact.trim().length > 0);
  const requestHeaders = await headers();
  const ipAddress =
    requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for") ?? undefined;
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  const text = [
    "New portfolio contact submission (next-landing)",
    "",
    `Name: ${data.name}`,
    `Contact: ${hasContact ? data.contact : "No contact provided"}`,
    `IP: ${ipAddress ?? "unknown"}`,
    `UA: ${userAgent ?? "unknown"}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!response.ok) {
      throw new Error(`Telegram send failed (${response.status})`);
    }
  } else {
    console.info("[contact]", text);
  }

  return { success: true as const };
}
