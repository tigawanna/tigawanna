import type { BetterAuthUser } from "@/lib/better-auth/auth";
import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { createMiddleware } from "@tanstack/react-start";

/**
 * Server-function middleware that requires an authenticated backstage admin.
 *
 * Use via {@link createBackstageServerFn} so every backstage RPC is guarded
 * before the handler runs — not only when the caller went through route UI.
 */
export const backstageAdminServerFnMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const viewer = await requireBackstageSession();

    return next({
      context: {
        viewer,
      },
    });
  },
);

/** Backstage admin user attached by {@link backstageAdminServerFnMiddleware}. */
export type BackstageServerFnContext = {
  viewer: BetterAuthUser;
};
