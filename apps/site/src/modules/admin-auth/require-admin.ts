import { adminSessionCookie, verifyAdminSessionToken } from "@/modules/admin-auth/session";
import { getCookie } from "@tanstack/react-start/server";

/**
 * Ensures the current request has a valid admin session cookie.
 *
 * Call at the start of protected server functions that mutate backstage data.
 * Route middleware provides a separate redirect-based guard for page loads.
 *
 * @throws {Error} When the session cookie is missing or the token is invalid/expired.
 * @returns Verified session payload containing `email`, `name`, and `exp`.
 */
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
