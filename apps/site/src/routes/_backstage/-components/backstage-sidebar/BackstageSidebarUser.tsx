import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { LogOut } from "lucide-react";

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BackstageSidebarUser() {
  const { isMobile, state } = useSidebar();
  const isExpanded = state === "expanded" || isMobile;
  const { viewer, logoutMutation } = useViewer();

  if (!viewer?.user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-test="backstage-user-menu"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={viewer.user.image ?? undefined} alt={viewer.user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(viewer.user.name)}
                </AvatarFallback>
              </Avatar>
              {isExpanded ? (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{viewer.user.name}</span>
                  <span className="truncate text-xs">{viewer.user.email}</span>
                </div>
              ) : null}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={viewer.user.image ?? undefined} alt={viewer.user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(viewer.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{viewer.user.name}</span>
                  <span className="truncate text-xs">{viewer.user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-test="backstage-sign-out"
            >
              {logoutMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <LogOut className="size-4" />
              )}
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
