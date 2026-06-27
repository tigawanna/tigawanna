import {
  adminOtpCookie,
  generateOtpCode,
  getOtpExpiryDate,
  getOtpResendCooldownMs,
  hashOtpCode,
  verifyOtpCode,
} from "@/modules/admin-auth/otp";
import {
  adminSessionCookie,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/modules/admin-auth/session";
import { adminLoginChallenges, and, desc, eq, gt, lt } from "@repo/db";
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

async function readAdminViewerFromCookie() {
  const token = getCookie(adminSessionCookie.name);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAdminSessionToken(token);
    if (!payload) {
      return null;
    }

    return {
      isAdmin: true as const,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

async function purgeExpiredChallenges() {
  const db = getDb();
  await db.delete(adminLoginChallenges).where(lt(adminLoginChallenges.expiresAt, new Date()));
}

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  return readAdminViewerFromCookie();
});

export const requestAdminOtp = createServerFn({ method: "POST" }).handler(async () => {
  await purgeExpiredChallenges();

  const db = getDb();
  const latestChallenge = await db
    .select()
    .from(adminLoginChallenges)
    .orderBy(desc(adminLoginChallenges.createdAt))
    .limit(1);

  const recentChallenge = latestChallenge[0];
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

export const verifyAdminOtp = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => verifyOtpSchema.parse(input))
  .handler(async ({ data }) => {
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

    if (!challenge || challenge.id !== challengeId) {
      deleteCookie(adminOtpCookie.name, { path: "/" });
      throw new Error("This login code expired. Request a new one.");
    }

    const isValid = await verifyOtpCode(data.code, challenge.codeHash);
    if (!isValid) {
      throw new Error("Invalid login code.");
    }

    await db.delete(adminLoginChallenges).where(gt(adminLoginChallenges.expiresAt, new Date(0)));

    const env = getServerEnv();
    const email = env.ADMIN_EMAIL ?? "admin@backstage.local";
    const name = email.split("@")[0] ?? "Admin";
    const sessionToken = await createAdminSessionToken(email, name);

    deleteCookie(adminOtpCookie.name, { path: "/" });
    setCookie(adminSessionCookie.name, sessionToken, cookieOptions(adminSessionCookie.maxAge));

    return {
      isAdmin: true as const,
      name,
      email,
    };
  });

export const signOutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(adminSessionCookie.name, { path: "/" });
  deleteCookie(adminOtpCookie.name, { path: "/" });
  return { success: true as const };
});
