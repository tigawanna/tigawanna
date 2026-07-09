import { getBackstageViewerFromHeaders } from "@/lib/better-auth/session.server";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

/**
 * Server middleware that attaches a backstage viewer to protected route context.
 */
export const backstageViewerMiddleware = createMiddleware().server(async ({ next, request }) => {
  const pathname = new URL(request.url).pathname;
  const viewer = await getBackstageViewerFromHeaders(request.headers);
  if (!viewer) {
    const returnTo = pathname.startsWith("/backstage/sign-in") ? "/backstage" : pathname;
    throw redirect({ to: "/backstage/sign-in", search: { returnTo } });
  }

  return await next({
    context: {
      viewer,
    },
  });
});
