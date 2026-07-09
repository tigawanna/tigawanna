import { auth } from "@/lib/better-auth/auth";
import {
  backstageForbiddenError,
  backstageSessionMissingError,
} from "@/lib/better-auth/auth-errors";
import { getRequestLog } from "@/lib/evlog/get-request-log";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { identifyUser } from "evlog/better-auth";

export type { BetterAuthSession, BetterAuthUser } from "@/lib/better-auth/auth";

/**
 * Loads the current Better Auth user for backstage (admin-only).
 */
export const getBackstageViewer = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (session) {
    identifyUser(getRequestLog(), session, {
      extend: (s) => ({ role: s.user.role }),
    });
  }

  const user = session?.user;
  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
});

/**
 * Requires an authenticated backstage admin session for server functions.
 */
export async function requireBackstageSession() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) {
    throw backstageSessionMissingError();
  }

  identifyUser(getRequestLog(), session, {
    extend: (s) => ({ role: s.user.role }),
  });

  if (session.user.role !== "admin") {
    throw backstageForbiddenError();
  }

  return session.user;
}

/**
 * Resolves a backstage admin user from request headers for route middleware.
 */
export async function getBackstageViewerFromHeaders(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  const user = session?.user;
  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}
