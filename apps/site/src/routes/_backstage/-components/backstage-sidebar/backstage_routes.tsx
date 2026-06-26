import { SidebarItem } from "@/components/sidebar/types";
import { FolderGit2, Inbox, LayoutGrid, Workflow } from "lucide-react";

export const backstage_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
  { title: "Repos", href: "/backstage/repos", icon: FolderGit2 },
  { title: "Workflow", href: "/backstage/workflow", icon: Workflow },
] satisfies SidebarItem[];
