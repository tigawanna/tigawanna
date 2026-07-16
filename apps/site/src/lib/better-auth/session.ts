import { createServerFn } from "@tanstack/react-start";
import { loadBackstageViewerFromRequest } from "@/lib/better-auth/session.server";

export type { BetterAuthSession, BetterAuthUser } from "@/lib/better-auth/auth";

/**
 * Loads the current Better Auth user for backstage (admin-only).
 */
export const getBackstageViewer = createServerFn({ method: "GET" }).handler(async () => {
  return loadBackstageViewerFromRequest();
});
