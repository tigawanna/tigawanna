import { getServerEnv } from "@/lib/envs/server-env";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const adminSessionPayloadSchema = z.object({
  exp: z.number().int().positive(),
  email: z.string().min(1),
  name: z.string().min(1),
});

export type AdminSessionPayload = z.infer<typeof adminSessionPayloadSchema>;

function getSessionSecretKey() {
  const secret = getServerEnv().ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed HS256 JWT for the admin session cookie.
 *
 * @param email - Admin email stored in the token payload.
 * @param name - Display name derived from or paired with the admin email.
 * @returns JWT string suitable for the `admin_session` cookie.
 */
export async function createAdminSessionToken(email: string, name: string) {
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecretKey());
}

/**
 * Verifies an admin session JWT signature, algorithm, and expiry via `jose`.
 *
 * @param token - Value from the `admin_session` cookie.
 * @returns Parsed payload when valid; `null` for invalid, expired, or malformed tokens.
 */
export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey(), {
      algorithms: ["HS256"],
    });

    const parsed = adminSessionPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Cookie metadata for the signed admin session JWT.
 *
 * `maxAge` matches the 30-day expiry embedded in the token.
 */
export const adminSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;
