import { adminSessionCookie, verifyAdminSessionToken } from "@/modules/admin-auth/session";
import { getCookie } from "@tanstack/react-start/server";

export async function requireAdminSession() {
  const token = getCookie(adminSessionCookie.name);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = await verifyAdminSessionToken(token);
  if (!payload) {
    throw new Error("Unauthorized");
  }

  return payload;
}
