import { SidebarItem } from "@/components/sidebar/types";
import { Inbox, LayoutGrid } from "lucide-react";

export const backstage_admin_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
] satisfies SidebarItem[];

export function getBackstagePrimaryRoutes(isAdmin: boolean): SidebarItem[] {
  if (!isAdmin) {
    return [];
  }

  return backstage_admin_routes;
}
