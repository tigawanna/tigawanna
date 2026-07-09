import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { contactFormSchema, type ContactFormValues } from "./contact-schema";
import { getTelegramClient } from "@/lib/telegram/client";
import { contactMessages } from "@repo/db";
import { getDb } from "@/lib/db/get-db";

function createMessageId() {
  return crypto.randomUUID();
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((input: ContactFormValues) => contactFormSchema.parse(input))
  .handler(async ({ data }) => {
    const hasContact = Boolean(data.contact && data.contact.trim().length > 0);
    const headers = getRequestHeaders();
    const ipAddress =
      headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for") ?? undefined;
    const userAgent = headers.get("user-agent") ?? undefined;
    const messageId = createMessageId();

    const text = [
      "New portfolio contact submission",
      "",
      `Name: ${data.name}`,
      `Contact: ${hasContact ? data.contact : "No contact provided"}`,
      "",
      "Message:",
      data.message,
    ].join("\n");

    let telegramSent = false;
    try {
      const result = await getTelegramClient().send(text);
      telegramSent = result.success;
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error: unknown) {
      const db = getDb();
      await db.insert(contactMessages).values({
        id: messageId,
        name: data.name,
        contact: hasContact ? data.contact : null,
        message: data.message,
        ipAddress,
        userAgent,
        telegramSent: false,
      });
      throw error;
    }

    const db = getDb();
    await db.insert(contactMessages).values({
      id: messageId,
      name: data.name,
      contact: hasContact ? data.contact : null,
      message: data.message,
      ipAddress,
      userAgent,
      telegramSent,
    });

    return { success: true as const };
  });
