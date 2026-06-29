import { SidebarItem } from "@/components/sidebar/types";
import { BookOpen, FolderGit2, Inbox, LayoutGrid } from "lucide-react";

export const backstage_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Journal", href: "/backstage/journal", icon: BookOpen },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
  { title: "Repos", href: "/backstage/repos", icon: FolderGit2 },
] satisfies SidebarItem[];
