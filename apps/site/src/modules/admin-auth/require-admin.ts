import {
  adminSessionInvalidError,
  adminSessionMissingError,
} from "@/modules/admin-auth/auth-errors";
import { logAuthEvent } from "@/modules/admin-auth/auth-log";
import { adminSessionCookie, verifyAdminSessionToken } from "@/modules/admin-auth/session";
import { getCookie } from "@tanstack/react-start/server";

export async function requireAdminSession() {
  const token = getCookie(adminSessionCookie.name);
  if (!token) {
    logAuthEvent({
      action: "require_admin_session",
      outcome: "failure",
      reason: "missing_cookie",
    });
    throw adminSessionMissingError();
  }

  const payload = await verifyAdminSessionToken(token);
  if (!payload) {
    logAuthEvent({
      action: "require_admin_session",
      outcome: "failure",
      reason: "invalid_token",
    });
    throw adminSessionInvalidError();
  }

  logAuthEvent({
    action: "require_admin_session",
    outcome: "success",
    email: payload.email,
  });

  return payload;
}
