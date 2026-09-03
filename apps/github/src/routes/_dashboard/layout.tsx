import { RouterErrorComponent } from "@/lib/tanstack/router/routerErrorComponent";
import { RouterNotFoundComponent } from "@/lib/tanstack/router/RouterNotFoundComponent";
import { RouterPendingComponent } from "@/lib/tanstack/router/RouterPendingComponent";
import { AppConfig } from "@/utils/system";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { DashboardLayout } from "./-components/dashboard-sidebar/DashboardLayout";
import { dashboard_account_routes } from "./-components/dashboard-sidebar/dashboard_routes";

export const Route = createFileRoute("/_dashboard")({
  pendingComponent: RouterPendingComponent,
  notFoundComponent: () => <RouterNotFoundComponent />,
  errorComponent: ({ error }) => <RouterErrorComponent error={error} />,
  component: DashboardShell,
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Dashboard`,
      },
    ],
  }),
});

function DashboardShell() {
  return (
    <Suspense fallback={<RouterPendingComponent />}>
      <DashboardLayout
        sidebarLabel="Menu"
        accountRoutes={dashboard_account_routes}
        accountLabel="Account"
      />
    </Suspense>
  );
}
