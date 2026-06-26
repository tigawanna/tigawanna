import { timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/server-env";

const OTP_CHALLENGE_COOKIE = "admin_otp_challenge";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export const adminOtpCookie = {
  name: OTP_CHALLENGE_COOKIE,
  maxAge: OTP_TTL_MS / 1000,
} as const;

function getSessionSecret() {
  const secret = getServerEnv().ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return secret;
}

export function generateOtpCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  return String(value % 1_000_000).padStart(6, "0");
}

export async function hashOtpCode(code: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${code}:${getSessionSecret()}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyOtpCode(code: string, expectedHash: string) {
  const actualHash = await hashOtpCode(code);
  if (actualHash.length !== expectedHash.length) {
    return false;
  }
  const left = new TextEncoder().encode(actualHash);
  const right = new TextEncoder().encode(expectedHash);
  return timingSafeEqual(left, right);
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function getOtpResendCooldownMs() {
  return OTP_RESEND_COOLDOWN_MS;
}
