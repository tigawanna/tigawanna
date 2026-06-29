import { getAdminSession, signOutAdmin } from "@/modules/admin-auth/admin-auth.functions";
import type { AdminViewer } from "@/modules/admin-auth/admin-auth.functions";
import { isAuthBypassEnabledOnServer } from "@/data-access-layer/auth/auth-utils";
import { getServerEnv } from "@/lib/envs/server-env";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getCookieFromRequest } from "@/modules/admin-auth/cookies";
import { adminSessionCookie, verifyAdminSessionToken } from "@/modules/admin-auth/session";

export type TViewer = AdminViewer;

/**
 * React Query options for the current admin viewer session.
 *
 * Loads via {@link getAdminSession}; `data` is `null` when signed out.
 */
export const viewerqueryOptions = queryOptions({
  queryKey: ["viewer"],
  queryFn: async () => {
    const viewer = await getAdminSession();
    return {
      data: viewer,
      error: null,
    };
  },
});

/**
 * Client hook exposing the admin viewer, admin flag, and sign-out mutation.
 *
 * Sign-out clears server cookies, invalidates the viewer query, and redirects home.
 */
export function useViewer() {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOutAdmin();
      void queryClient.invalidateQueries(viewerqueryOptions);
      throw redirect({ to: "/", search: {} });
    },
  });
  const viewerQuery = useSuspenseQuery(viewerqueryOptions);

  return {
    viewerQuery,
    viewer: viewerQuery.data.data ?? undefined,
    isAdmin: viewerQuery.data.data?.isAdmin === true,
    logoutMutation,
  } as const;
}

/**
 * Server middleware that attaches an admin viewer to backstage route context.
 *
 * When {@link isAuthBypassEnabledOnServer} is active, injects a synthetic admin viewer.
 * Otherwise verifies the `admin_session` cookie and redirects unauthenticated requests
 * to `/backstage/sign-in` with a `returnTo` search param.
 */
export const backstageViewerMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (isAuthBypassEnabledOnServer(getServerEnv())) {
    const email = getServerEnv().ADMIN_EMAIL ?? "admin@backstage.local";
    return await next({
      context: {
        viewer: {
          isAdmin: true as const,
          name: email.split("@")[0] ?? "Admin",
          email,
        },
      },
    });
  }

  const token = getCookieFromRequest(request, adminSessionCookie.name);
  if (!token) {
    const pathname = new URL(request.url).pathname;
    const returnTo = pathname.startsWith("/backstage/sign-in") ? "/backstage" : pathname;
    throw redirect({ to: "/backstage/sign-in", search: { returnTo } });
  }

  const payload = await verifyAdminSessionToken(token);
  if (!payload) {
    const pathname = new URL(request.url).pathname;
    const returnTo = pathname.startsWith("/backstage/sign-in") ? "/backstage" : pathname;
    throw redirect({ to: "/backstage/sign-in", search: { returnTo } });
  }

  return await next({
    context: {
      viewer: {
        isAdmin: true as const,
        name: payload.name,
        email: payload.email,
      },
    },
  });
});

export { isAdminUser } from "@/data-access-layer/auth/auth-utils";
