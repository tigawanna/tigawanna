import { SidebarItem } from "@/components/sidebar/types";
import { BookOpen, Inbox, LayoutGrid, Search } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export const backstage_routes = [
  { title: "Messages", href: "/backstage/messages", icon: Inbox },
  { title: "Journal", href: "/backstage/journal", icon: BookOpen },
  { title: "Projects", href: "/backstage/projects", icon: LayoutGrid },
  { title: "GitHub", href: "/backstage/repos", icon: FaGithub },
  { title: "Embedding search", href: "/backstage/embedding-search", icon: Search },
] satisfies SidebarItem[];
