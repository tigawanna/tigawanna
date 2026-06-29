import { timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/envs/server-env";

const OTP_CHALLENGE_COOKIE = "admin_otp_challenge";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_CODE_SPACE = 1_000_000;
const OTP_MAX_VALID_UINT32 = Math.floor(0x1_0000_0000 / OTP_CODE_SPACE) * OTP_CODE_SPACE;

/** Maximum failed OTP verifications allowed per challenge before invalidation. */
export const MAX_OTP_VERIFY_ATTEMPTS = 5;

/** Maximum OTP send requests allowed per client IP within {@link getOtpRequestWindowMs}. */
export const MAX_OTP_REQUESTS_PER_HOUR = 10;

/**
 * Cookie metadata for the OTP challenge binding.
 *
 * The cookie value is the challenge row id; the plaintext code is never stored client-side.
 */
export const adminOtpCookie = {
  name: OTP_CHALLENGE_COOKIE,
  maxAge: OTP_TTL_MS / 1000,
} as const;

function getOtpPepper() {
  const env = getServerEnv();
  const pepper = env.ADMIN_OTP_PEPPER ?? env.ADMIN_SESSION_SECRET;
  if (!pepper) {
    throw new Error("ADMIN_OTP_PEPPER or ADMIN_SESSION_SECRET must be configured");
  }
  return pepper;
}

/**
 * Generates a uniformly random 6-digit OTP using rejection sampling
 * to avoid modulo bias from `uint32 % 1_000_000`.
 *
 * @returns Zero-padded 6-digit numeric string.
 */
export function generateOtpCode() {
  let value = 0;
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  } while (value >= OTP_MAX_VALID_UINT32);

  return String(value % OTP_CODE_SPACE).padStart(6, "0");
}

/**
 * Hashes an OTP with a server-side pepper before persistence.
 *
 * @param code - Plaintext 6-digit OTP submitted by the user or generated for delivery.
 * @returns Hex-encoded SHA-256 digest.
 */
export async function hashOtpCode(code: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${code}:${getOtpPepper()}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compares a submitted OTP to a stored hash in constant time.
 *
 * @param code - Plaintext OTP from the user.
 * @param expectedHash - Previously persisted hash for the active challenge.
 * @returns `true` when the code matches the stored hash.
 */
export async function verifyOtpCode(code: string, expectedHash: string) {
  const actualHash = await hashOtpCode(code);
  if (actualHash.length !== expectedHash.length) {
    return false;
  }
  const left = new TextEncoder().encode(actualHash);
  const right = new TextEncoder().encode(expectedHash);
  return timingSafeEqual(left, right);
}

/** Returns the absolute expiry timestamp for a newly created OTP challenge. */
export function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_TTL_MS);
}

/** Minimum delay between OTP resend requests for the same client IP. */
export function getOtpResendCooldownMs() {
  return OTP_RESEND_COOLDOWN_MS;
}

/** Rolling window used to cap OTP send volume per client IP. */
export function getOtpRequestWindowMs() {
  return 60 * 60 * 1000;
}
