import { getBackstageViewer } from "@/lib/better-auth/session";
import type { BetterAuthUser } from "@/lib/better-auth/auth";
import { authClient } from "@/lib/better-auth/client";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

export type TViewer = BetterAuthUser;

/**
 * React Query options for the current backstage viewer session.
 */
export const viewerqueryOptions = queryOptions({
  queryKey: ["viewer"],
  queryFn: async () => {
    const viewer = await getBackstageViewer();
    return {
      data: viewer,
      error: null,
    };
  },
  staleTime: 0,
});

/**
 * Client hook exposing the admin viewer, admin flag, and sign-out mutation.
 */
export function useViewer() {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) {
        throw error;
      }
      void queryClient.invalidateQueries(viewerqueryOptions);
      throw redirect({ to: "/", search: {} });
    },
  });
  const viewerQuery = useSuspenseQuery(viewerqueryOptions);

  const viewer = viewerQuery.data.data ?? undefined;

  return {
    viewerQuery,
    viewer,
    isAdmin: viewer?.role === "admin",
    logoutMutation,
  } as const;
}
