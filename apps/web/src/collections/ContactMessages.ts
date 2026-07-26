import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

/**
 * Inbox for landing contact-form submissions.
 * Created only via the server action (Local API + overrideAccess) — not from admin UI.
 * Stores only an approximate request location (city/region/country), not IP or user-agent.
 */
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: {
    singular: "Contact message",
    plural: "Contact messages",
  },
  access: {
    create: () => false,
    delete: authenticated,
    read: authenticated,
    update: () => false,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "contact", "approximateLocation", "telegramSent", "createdAt"],
    group: "Inbox",
    description:
      "Messages from the landing contact form. Telegram delivery status is recorded on each row.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "contact",
      type: "text",
      admin: {
        description: "Email, phone, or other reply details (optional on the form).",
      },
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "approximateLocation",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Rough city/region/country from geo headers or IP lookup. IP itself is not stored.",
      },
    },
    {
      name: "telegramSent",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Whether Telegram received this submission.",
      },
    },
  ],
  timestamps: true,
};
