import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { contactFormSchema, type ContactFormValues } from "@repo/ui/landing";
import { getTelegramClient } from "@/lib/telegram/client";
import { persistContactMessage } from "./contact.server";

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
      await persistContactMessage(data, {
        messageId,
        hasContact,
        ipAddress,
        userAgent,
        telegramSent: false,
      });
      throw error;
    }

    await persistContactMessage(data, {
      messageId,
      hasContact,
      ipAddress,
      userAgent,
      telegramSent,
    });

    return { success: true as const };
  });
