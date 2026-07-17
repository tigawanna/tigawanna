import { getTelegramClient } from "@/lib/telegram/client";

type OtpDeliveryType = "sign-in" | "email-verification" | "forget-password" | "change-email";

/**
 * Formats and delivers a Better Auth OTP to the configured Telegram channel.
 * Fire-and-forget: callers should not await this (avoids timing attacks).
 */
export function sendOtpViaTelegram(input: {
  email: string;
  otp: string;
  type: OtpDeliveryType;
}): void {
  const label =
    input.type === "sign-in"
      ? "Sign-in"
      : input.type === "email-verification"
        ? "Email verification"
        : input.type === "forget-password"
          ? "Password reset"
          : "Email change";

  const message = [
    `Tigawanna backstage ${label} OTP`,
    "",
    `Email: ${input.email}`,
    `Code: ${input.otp}`,
    "",
    "Expires in a few minutes. If you did not request this, ignore it.",
  ].join("\n");

  void getTelegramClient()
    .send(message)
    .then((result) => {
      if (!result.success) {
        console.error("[auth] Failed to send OTP via Telegram:", result.message);
      }
    })
    .catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : String(error);
      console.error("[auth] Failed to send OTP via Telegram:", detail);
    });
}
