import type { BetterAuthUser } from "@/lib/better-auth/auth";
import { createMiddleware, createServerFn, type Method } from "@tanstack/react-start";

const backstageAdminServerFnMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { requireBackstageSession } = await import("@/lib/better-auth/session.server");
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

/**
 * Creates a server function with backstage admin auth enforced by middleware.
 *
 * Prefer this over `createServerFn` + manual `requireBackstageSession()` in handlers
 * so authorization cannot be forgotten on new backstage endpoints.
 */
export function createBackstageServerFn(options?: { method?: Method }) {
  return createServerFn({ method: options?.method ?? "GET" }).middleware([
    backstageAdminServerFnMiddleware,
  ]);
}
