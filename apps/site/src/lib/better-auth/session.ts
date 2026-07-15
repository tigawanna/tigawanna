import { createServerFn } from "@tanstack/react-start";

export type { BetterAuthSession, BetterAuthUser } from "@/lib/better-auth/auth";

/**
 * Loads the current Better Auth user for backstage (admin-only).
 */
export const getBackstageViewer = createServerFn({ method: "GET" }).handler(async () => {
  const { loadBackstageViewerFromRequest } = await import("@/lib/better-auth/session.server");
  return loadBackstageViewerFromRequest();
});
