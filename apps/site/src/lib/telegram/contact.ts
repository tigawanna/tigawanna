import { createServerFn } from "@tanstack/react-start";
import { contactFormSchema, type ContactFormValues } from "./contact-schema";
import { TelegramNotifier } from "./client";

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: ContactFormValues) => contactFormSchema.parse(input))
  .handler(async ({ data }) => {
    const hasContact = Boolean(data.contact && data.contact.trim().length > 0);
    const notifier = new TelegramNotifier();

    const text = [
      "New portfolio contact submission",
      "",
      `Name: ${data.name}`,
      `Contact: ${hasContact ? data.contact : "No contact provided"}`,
      "",
      "Message:",
      data.message,
    ].join("\n");

    const result = await notifier.send(text);

    if (!result.success) {
      throw new Error(result.message);
    }

    return { success: true as const };
  });
