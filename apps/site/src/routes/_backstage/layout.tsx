import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { backstageViewerMiddleware } from "@/data-access-layer/auth/viewer";
import { RouterNotFoundComponent } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { AppConfig } from "@/utils/system";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BackstageLayout } from "./-components/backstage-sidebar/BackstageLayout";
import {
  backstage_admin_routes,
  getBackstagePrimaryRoutes,
} from "./-components/backstage-sidebar/backstage_routes";

export const Route = createFileRoute("/_backstage")({
  pendingComponent: () => <RouterPendingComponent />,
  notFoundComponent: () => <RouterNotFoundComponent />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
  server: {
    middleware: [backstageViewerMiddleware],
  },
  beforeLoad: ({ context, location }) => {
    if (!context.viewer?.isAdmin) {
      throw redirect({
        to: "/backstage/sign-in",
        search: { returnTo: location.pathname },
      });
    }
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

  return (
    <BackstageLayout
      sidebarRoutes={getBackstagePrimaryRoutes(isAdmin)}
      sidebarLabel="Backstage"
      adminRoutes={isAdmin ? backstage_admin_routes : []}
      adminLabel="Administration"
    />
  );
}
