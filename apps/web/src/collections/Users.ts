import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    admin: authenticated,
    // Open create so the first admin can register; tighten once seeded.
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    /**
     * Forgot-password always returns HTTP 200 (even when the user is missing).
     * Log the submitted identity so the Next.js terminal shows what actually happened.
     */
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation !== "forgotPassword") {
          return args;
        }

        const email =
          typeof args.data?.email === "string" ? args.data.email.toLowerCase().trim() : "";
        const username =
          typeof args.data?.username === "string" ? args.data.username.toLowerCase().trim() : "";

        let matchedUserEmail: string | null = null;
        if (email) {
          const found = await req.payload.find({
            collection: "users",
            depth: 0,
            limit: 1,
            overrideAccess: true,
            where: { email: { equals: email } },
          });
          matchedUserEmail = found.docs[0]?.email ?? null;
        }

        req.payload.logger.info({
          msg: "[forgotPassword] request received",
          email: email || null,
          username: username || null,
          userFound: Boolean(matchedUserEmail),
          matchedUserEmail,
          serverURL: req.payload.config.serverURL,
          willSendEmail: Boolean(matchedUserEmail),
        });

        if (!matchedUserEmail) {
          req.payload.logger.warn({
            msg: "[forgotPassword] no matching user — Payload will still return Success but will NOT call the email adapter",
            submittedEmail: email || null,
          });
        }

        return args;
      },
    ],
    afterOperation: [
      async ({ operation, req, result }) => {
        if (operation !== "forgotPassword") {
          return result;
        }

        // Only runs when a user matched (Payload returns early otherwise).
        const token = typeof result === "string" ? result : null;
        req.payload.logger.info({
          msg: "[forgotPassword] user matched — email adapter should have run",
          tokenPreview: token ? `${token.slice(0, 8)}…` : null,
        });

        return result;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
