import { getDb } from "@/lib/db/get-db.server";
import { contactMessages } from "@repo/db";
import type { ContactFormValues } from "@repo/ui/landing";

export async function persistContactMessage(
  data: ContactFormValues,
  options: {
    messageId: string;
    hasContact: boolean;
    ipAddress?: string;
    userAgent?: string;
    telegramSent: boolean;
  },
) {
  const db = getDb();
  await db.insert(contactMessages).values({
    id: options.messageId,
    name: data.name,
    contact: options.hasContact ? data.contact : null,
    message: data.message,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    telegramSent: options.telegramSent,
  });
}
