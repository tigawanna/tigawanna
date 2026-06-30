import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { backstageViewerMiddleware, viewerqueryOptions } from "@/data-access-layer/auth/viewer";
import { RouterNotFoundSection } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { AppConfig } from "@/utils/system";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BackstageLayout } from "./-components/backstage-sidebar/BackstageLayout";
import { backstage_routes } from "./-components/backstage-sidebar/backstage_routes";

export const Route = createFileRoute("/_backstage")({
  pendingComponent: () => <RouterPendingComponent />,
  notFoundComponent: () => <RouterNotFoundSection />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
  server: {
    middleware: [backstageViewerMiddleware],
  },
  beforeLoad: async ({ context, location }) => {
    const viewer = await context.queryClient.fetchQuery(viewerqueryOptions);
    if (!viewer.data?.isAdmin) {
      throw redirect({
        to: "/backstage/sign-in",
        search: { returnTo: location.pathname },
      });
    }

    return {
      viewer: viewer.data ?? undefined,
    };
  },
  component: BackstageShell,
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Backstage`,
        description: "Site controls",
      },
    ],
  }),
});

function BackstageShell() {
  const { viewer } = Route.useRouteContext();
  const isAdmin = isAdminUser(viewer);

  return <BackstageLayout routes={isAdmin ? backstage_routes : []} label="Backstage" />;
}
