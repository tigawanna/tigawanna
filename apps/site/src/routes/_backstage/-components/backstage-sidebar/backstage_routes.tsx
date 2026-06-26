import { SidebarItem } from "@/components/sidebar/types";
import { Inbox, LayoutGrid, Sparkles } from "lucide-react";

export const backstage_admin_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
  { title: "Project enrichment", href: "/backstage/projects-enrichment", icon: Sparkles },
] satisfies SidebarItem[];

export function getBackstagePrimaryRoutes(isAdmin: boolean): SidebarItem[] {
  if (!isAdmin) {
    return [];
  }

  return backstage_admin_routes;
}
