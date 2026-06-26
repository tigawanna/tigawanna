import { getSession } from "@/lib/auth.functions";
import { getAuth } from "@/lib/auth";
import { isAdminUser, isAuthBypassEnabledOnServer } from "@/data-access-layer/auth/auth-utils";
import { authClient, type BetterAuthSession } from "@/lib/better-auth/client";
import { getWorkerEnv } from "@/lib/worker-env";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

type ViewerUser = BetterAuthSession["user"];
type ViewerSession = BetterAuthSession["session"];

export type TViewer = {
  user?: ViewerUser;
  session?: ViewerSession;
};

export const viewerqueryOptions = queryOptions({
  queryKey: ["viewer"],
  queryFn: async () => {
    const session = await getSession();
    if (!session) {
      return { data: null, error: null };
    }
    return {
      data: { user: session.user, session: session.session },
      error: null,
    };
  },
});

export function useViewer() {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
      void queryClient.invalidateQueries(viewerqueryOptions);
      throw redirect({ to: "/", search: {} });
    },
  });
  const viewerQuery = useSuspenseQuery(viewerqueryOptions);

  return {
    viewerQuery,
    viewer: {
      user: viewerQuery.data.data?.user,
      session: viewerQuery.data.data?.session,
    },
    isAdmin: isAdminUser(viewerQuery.data.data?.user),
    logoutMutation,
  } as const;
}

export const backstageViewerMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (isAuthBypassEnabledOnServer(getWorkerEnv())) {
    return await next();
  }

  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    const pathname = new URL(request.url).pathname;
    const returnTo = pathname.startsWith("/backstage/sign-in") ? "/backstage" : pathname;
    throw redirect({ to: "/backstage/sign-in", search: { returnTo } });
  }

  return await next({
    context: {
      viewer: { user: session.user, session: session.session },
    },
  });
});

export { isAdminUser };
