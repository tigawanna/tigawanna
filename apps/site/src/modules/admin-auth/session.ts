import { getServerEnv } from "@/lib/envs/server-env";
import { z } from "zod";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const adminSessionPayloadSchema = z.object({
  exp: z.number().int().positive(),
  email: z.string().min(1),
  name: z.string().min(1),
});

type AdminSessionPayload = z.infer<typeof adminSessionPayloadSchema>;

function getSessionSecret() {
  const secret = getServerEnv().ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return secret;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * Creates a signed, httpOnly-compatible admin session token for the given identity.
 *
 * Token format: `{base64url(payload)}.{base64url(hmac-sha256)}`.
 *
 * @param email - Admin email stored in the session payload.
 * @param name - Display name derived from or paired with the admin email.
 * @returns Signed session token suitable for the `admin_session` cookie.
 */
export async function createAdminSessionToken(email: string, name: string) {
  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    email,
    name,
  };
  const payloadPart = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importHmacKey(getSessionSecret());
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  return `${payloadPart}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verifies an admin session token signature and expiry.
 *
 * @param token - Value from the `admin_session` cookie.
 * @returns Parsed payload when valid; `null` for invalid, expired, or malformed tokens.
 */
export async function verifyAdminSessionToken(token: string) {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const key = await importHmacKey(getSessionSecret());
  const signature = fromBase64Url(signaturePart);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(payloadPart),
  );
  if (!valid) {
    return null;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)));
  } catch {
    return null;
  }

  const parsed = adminSessionPayloadSchema.safeParse(decoded);
  if (!parsed.success) {
    return null;
  }

  if (parsed.data.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsed.data;
}

/**
 * Cookie metadata for the signed admin session token.
 *
 * `maxAge` matches the 30-day expiry embedded in the token payload.
 */
export const adminSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;
