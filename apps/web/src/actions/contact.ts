"use server";

import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/components/landing/sections/contact/contact-schema";
import { resolveApproximateLocation } from "@/lib/geo/approximate-location";
import { getTelegramClient } from "@/lib/telegram/client";

type PersistMeta = {
  hasContact: boolean;
  approximateLocation?: string;
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
      approximateLocation: meta.approximateLocation ?? null,
      telegramSent: meta.telegramSent,
    },
    overrideAccess: true,
  });
}

/**
 * Relays a landing contact submission to Telegram and stores it in Payload.
 * Always persist; rethrow when Telegram send fails after credentials exist.
 * Request metadata is limited to an approximate location (no IP / user-agent).
 */
export async function sendContactMessage(input: ContactFormValues) {
  const data = contactFormSchema.parse(input);
  const hasContact = Boolean(data.contact && data.contact.trim().length > 0);
  const requestHeaders = await headers();
  const location = await resolveApproximateLocation(requestHeaders);
  const approximateLocation = location?.label;

  const text = [
    "New portfolio contact submission (web)",
    "",
    `Name: ${data.name}`,
    `Contact: ${hasContact ? data.contact : "No contact provided"}`,
    `Approx. location: ${approximateLocation ?? "unknown"}`,
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
      approximateLocation,
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
      approximateLocation,
      telegramSent: false,
    });
    throw error;
  }

  await persistContactMessage(data, {
    hasContact,
    approximateLocation,
    telegramSent,
  });

  return { success: true as const };
}
