"use server";

import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/components/landing/sections/contact/contact-schema";
import { getTelegramClient } from "@/lib/telegram/client";

type PersistMeta = {
  hasContact: boolean;
  ipAddress?: string;
  userAgent?: string;
  telegramSent: boolean;
};

/**
 * Persists a contact submission into the Payload inbox collection.
 */
async function persistContactMessage(data: ContactFormValues, meta: PersistMeta) {
  const payload = await getPayload({ config });

  await payload.create({
    collection: "contact-messages",
    data: {
      name: data.name,
      contact: meta.hasContact ? data.contact : null,
      message: data.message,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      telegramSent: meta.telegramSent,
    },
    overrideAccess: true,
  });
}

/**
 * Relays a landing contact submission to Telegram and stores it in Payload.
 * Mirrors the site app flow: always persist; rethrow when Telegram send fails after credentials exist.
 */
export async function sendContactMessage(input: ContactFormValues) {
  const data = contactFormSchema.parse(input);
  const hasContact = Boolean(data.contact && data.contact.trim().length > 0);
  const requestHeaders = await headers();
  const ipAddress =
    requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for") ?? undefined;
  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  const text = [
    "New portfolio contact submission (web)",
    "",
    `Name: ${data.name}`,
    `Contact: ${hasContact ? data.contact : "No contact provided"}`,
    `IP: ${ipAddress ?? "unknown"}`,
    `UA: ${userAgent ?? "unknown"}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  const telegram = getTelegramClient();
  let telegramSent = false;

  if (!telegram) {
    console.warn("[contact] Telegram credentials unset — persisting message only");
    await persistContactMessage(data, {
      hasContact,
      ipAddress,
      userAgent,
      telegramSent: false,
    });
    return { success: true as const };
  }

  try {
    const result = await telegram.send(text);
    telegramSent = result.success;
    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error: unknown) {
    await persistContactMessage(data, {
      hasContact,
      ipAddress,
      userAgent,
      telegramSent: false,
    });
    throw error;
  }

  await persistContactMessage(data, {
    hasContact,
    ipAddress,
    userAgent,
    telegramSent,
  });

  return { success: true as const };
}
