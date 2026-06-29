import {
  adminOtpCookie,
  generateOtpCode,
  getOtpExpiryDate,
  getOtpRequestWindowMs,
  getOtpResendCooldownMs,
  hashOtpCode,
  MAX_OTP_REQUESTS_PER_HOUR,
  MAX_OTP_VERIFY_ATTEMPTS,
  verifyOtpCode,
} from "@/modules/admin-auth/otp";
import { getClientIp } from "@/modules/admin-auth/request-ip";
import {
  adminSessionCookie,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/modules/admin-auth/session";
import { adminLoginChallenges, and, count, desc, eq, gt, lt } from "@repo/db";
import { requireHumanVerification } from "@/lib/botid/require-human-verification";
import { getDb } from "@/lib/db/get-db";
import { TelegramNotifier } from "@/lib/telegram/client";
import { getServerEnv } from "@/lib/envs/server-env";
import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";

/** Authenticated backstage viewer returned after a successful OTP login. */
export type AdminViewer = {
  isAdmin: true;
  name: string;
  email: string;
};

const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getRequestProtocol({ xForwardedProto: true }) === "https",
    path: "/",
    maxAge,
  };
}

async function purgeExpiredChallenges() {
  const db = getDb();
  await db.delete(adminLoginChallenges).where(lt(adminLoginChallenges.expiresAt, new Date()));
}

async function countRecentOtpRequests(requestIp: string) {
  const db = getDb();
  const windowStart = new Date(Date.now() - getOtpRequestWindowMs());
  const [result] = await db
    .select({ total: count() })
    .from(adminLoginChallenges)
    .where(
      and(
        eq(adminLoginChallenges.requestIp, requestIp),
        gt(adminLoginChallenges.createdAt, windowStart),
      ),
    );

  return result?.total ?? 0;
}

function invalidateOtpChallengeCookie() {
  deleteCookie(adminOtpCookie.name, { path: "/" });
}

/**
 * Reads the current admin session from the `admin_session` cookie.
 * Returns `null` when unauthenticated or when the token is invalid/expired.
 */
export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(adminSessionCookie.name);
  if (!token) {
    return null;
  }

  const payload = await verifyAdminSessionToken(token);
  if (!payload) {
    return null;
  }

  return {
    isAdmin: true as const,
    name: payload.name,
    email: payload.email,
  };
});

/**
 * Starts a backstage login by creating an OTP challenge and sending the code to Telegram.
 *
 * Rate limits:
 * - One resend per client IP every {@link getOtpResendCooldownMs}.
 * - At most {@link MAX_OTP_REQUESTS_PER_HOUR} requests per client IP per hour.
 *
 * Sets the `admin_otp_challenge` httpOnly cookie that must be present during verification.
 */
export const requestAdminOtp = createServerFn({ method: "POST" }).handler(async () => {
  await requireHumanVerification();
  await purgeExpiredChallenges();

  const requestIp = getClientIp();
  const db = getDb();

  const recentRequestCount = await countRecentOtpRequests(requestIp);
  if (recentRequestCount >= MAX_OTP_REQUESTS_PER_HOUR) {
    throw new Error("Too many login code requests. Try again later.");
  }

  const [recentChallenge] = await db
    .select()
    .from(adminLoginChallenges)
    .where(eq(adminLoginChallenges.requestIp, requestIp))
    .orderBy(desc(adminLoginChallenges.createdAt))
    .limit(1);

  if (recentChallenge) {
    const elapsed = Date.now() - recentChallenge.createdAt.getTime();
    if (elapsed < getOtpResendCooldownMs()) {
      throw new Error("Wait a minute before requesting another code.");
    }
  }

  const code = generateOtpCode();
  const challengeId = crypto.randomUUID();
  const codeHash = await hashOtpCode(code);
  const expiresAt = getOtpExpiryDate();

  await db.insert(adminLoginChallenges).values({
    id: challengeId,
    codeHash,
    expiresAt,
    requestIp,
  });

  const notifier = new TelegramNotifier();
  const result = await notifier.send(
    [
      "Backstage login code",
      "",
      code,
      "",
      "Expires in 10 minutes.",
      "If you did not request this, ignore it.",
    ].join("\n"),
  );

  if (!result.success) {
    await db.delete(adminLoginChallenges).where(eq(adminLoginChallenges.id, challengeId));
    throw new Error("Could not send the login code to Telegram.");
  }

  setCookie(adminOtpCookie.name, challengeId, cookieOptions(adminOtpCookie.maxAge));

  return { success: true as const };
});

/**
 * Completes backstage login by verifying the OTP against the challenge bound to
 * the `admin_otp_challenge` cookie.
 *
 * On success, clears the OTP cookie, sets the signed `admin_session` cookie,
 * and returns the authenticated viewer.
 *
 * Failed attempts increment a per-challenge counter and invalidate the challenge
 * after {@link MAX_OTP_VERIFY_ATTEMPTS} failures.
 */
export const verifyAdminOtp = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => verifyOtpSchema.parse(input))
  .handler(async ({ data }) => {
    await requireHumanVerification();
    const challengeId = getCookie(adminOtpCookie.name);
    if (!challengeId) {
      throw new Error("Request a new login code first.");
    }

    await purgeExpiredChallenges();

    const db = getDb();
    const [challenge] = await db
      .select()
      .from(adminLoginChallenges)
      .where(
        and(
          eq(adminLoginChallenges.id, challengeId),
          gt(adminLoginChallenges.expiresAt, new Date()),
        ),
      );

    if (!challenge) {
      invalidateOtpChallengeCookie();
      throw new Error("This login code expired. Request a new one.");
    }

    const isValid = await verifyOtpCode(data.code, challenge.codeHash);
    if (!isValid) {
      const nextAttemptCount = challenge.attemptCount + 1;
      if (nextAttemptCount >= MAX_OTP_VERIFY_ATTEMPTS) {
        await db.delete(adminLoginChallenges).where(eq(adminLoginChallenges.id, challengeId));
        invalidateOtpChallengeCookie();
        throw new Error("Too many failed attempts. Request a new code.");
      }

      await db
        .update(adminLoginChallenges)
        .set({ attemptCount: nextAttemptCount })
        .where(eq(adminLoginChallenges.id, challengeId));

      throw new Error("Invalid login code.");
    }

    await db.delete(adminLoginChallenges).where(eq(adminLoginChallenges.id, challengeId));

    const env = getServerEnv();
    const email = env.ADMIN_EMAIL ?? "admin@backstage.local";
    const name = email.split("@")[0] ?? "Admin";
    const sessionToken = await createAdminSessionToken(email, name);

    invalidateOtpChallengeCookie();
    setCookie(adminSessionCookie.name, sessionToken, cookieOptions(adminSessionCookie.maxAge));

    return {
      isAdmin: true as const,
      name,
      email,
    };
  });

/**
 * Clears backstage auth cookies and ends the current admin session in the browser.
 * Existing signed session tokens remain valid until expiry if reused directly.
 */
export const signOutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(adminSessionCookie.name, { path: "/" });
  invalidateOtpChallengeCookie();
  return { success: true as const };
});
