import { SidebarItem } from "@/components/sidebar/types";
import { BookOpen, Brain, FolderGit2, Inbox, LayoutGrid, Workflow } from "lucide-react";

export const backstage_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Journal", href: "/backstage/journal", icon: BookOpen },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
  { title: "Repos", href: "/backstage/repos", icon: FolderGit2 },
  { title: "Workflow", href: "/backstage/workflow", icon: Workflow },
  { title: "Embeddings", href: "/backstage/embeddings", icon: Brain },
] satisfies SidebarItem[];
