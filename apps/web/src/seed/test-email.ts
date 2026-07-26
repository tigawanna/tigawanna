import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import payloadConfig from "../payload.config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Tests Payload email delivery.
 *
 * Modes (via `TEST_EMAIL_MODE`):
 * - `send` (default) — raw `payload.sendEmail`
 * - `forgot` — real forgot-password flow (`payload.forgotPassword`)
 *
 * Run from `apps/web`:
 *   pnpm test:email
 *   pnpm test:email:forgot
 */
async function testEmail() {
  const mode = (process.env.TEST_EMAIL_MODE?.trim() || "send") as "send" | "forgot";
  const payload = await getPayload({ config: payloadConfig });

  try {
    if (mode === "forgot") {
      const preferredEmail = process.env.ADMIN_EMAIL?.trim();
      const existing = await payload.find({
        collection: "users",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: preferredEmail ? { email: { equals: preferredEmail } } : undefined,
      });

      const user = existing.docs[0];
      if (!user?.email) {
        throw new Error(
          preferredEmail
            ? `No users doc with email "${preferredEmail}". Forgot-password fails silently when the user is missing.`
            : "No users found. Create an admin user before testing forgot-password.",
        );
      }

      const to = user.email;

      payload.logger.info({
        msg: "Triggering forgotPassword",
        to,
        serverURL: payload.config.serverURL,
      });

      const token = await payload.forgotPassword({
        collection: "users",
        data: { email: to },
      });

      if (!token) {
        throw new Error(
          `forgotPassword returned null for "${to}" (user missing or email disabled).`,
        );
      }

      payload.logger.info({
        msg: "Forgot-password email requested — check Telegram for the reset link",
        to,
        tokenPreview: `${token.slice(0, 8)}…`,
        expectedLink: `${payload.config.serverURL}${payload.config.routes.admin}/reset/${token}`,
      });
      return;
    }

    const to = process.env.ADMIN_EMAIL?.trim() || "test@example.com";
    const result = await payload.sendEmail({
      to,
      subject: "Payload → Telegram test",
      text: [
        "This is a test message from the Payload email adapter.",
        "",
        "If you see this in Telegram, routing works.",
        `Sent at: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    payload.logger.info({ msg: "Test email finished", result, to });
  } finally {
    await payload.destroy();
  }
}

await testEmail();
