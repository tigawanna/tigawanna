import { SidebarLinks } from "@/components/sidebar/SidebarLinks";
import { SidebarItem } from "@/components/sidebar/types";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Helmet } from "@/components/wrappers/custom-helmet";
import { TSRBreadCrumbs } from "@/lib/tanstack/router/TSRBreadCrumbs";
import { AppConfig } from "@/utils/system";
import { Outlet } from "@tanstack/react-router";
import { BackstageSidebarFooter } from "./BackstageSidebarFooter";
import { BackstageSidebarHeader } from "./BackstageSidebarHeader";

interface BackstageLayoutProps {
  sidebarRoutes: SidebarItem[];
  sidebarLabel: string;
  adminRoutes: SidebarItem[];
  adminLabel: string;
}

export function BackstageLayout({
  sidebarRoutes,
  sidebarLabel,
  adminRoutes,
  adminLabel,
}: BackstageLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Helmet title={`${AppConfig.name} | Backstage`} description="Site controls" />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <BackstageSidebarHeader />
        </SidebarHeader>
        <SidebarContent>
          {sidebarRoutes.length > 0 ? (
            <SidebarGroup className="bg-base-300">
              <SidebarGroupLabel className="text-sm font-semibold tracking-wide">
                {sidebarLabel}
              </SidebarGroupLabel>
              <SidebarLinks links={sidebarRoutes} />
            </SidebarGroup>
          ) : null}
          {adminRoutes.length > 0 ? (
            <SidebarGroup className="bg-base-300">
              <SidebarGroupLabel className="text-sm font-semibold tracking-wide">
                {adminLabel}
              </SidebarGroupLabel>
              <SidebarLinks links={adminRoutes} />
            </SidebarGroup>
          ) : null}
        </SidebarContent>
        <SidebarFooter className="gap-3 pb-3">
          <BackstageSidebarFooter />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="bg-base-100 sticky top-0 z-30 flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <TSRBreadCrumbs />
          </div>
        </header>
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
