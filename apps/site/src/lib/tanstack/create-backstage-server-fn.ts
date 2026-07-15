import { backstageAdminServerFnMiddleware } from "@/middleware/backstage-admin.server";
import { createServerFn, type Method } from "@tanstack/react-start";

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
