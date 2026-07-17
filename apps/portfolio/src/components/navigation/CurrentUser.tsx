import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { MutationButton } from "@/lib/tanstack/query/MutationButton";
import { UserCircle } from "lucide-react";

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

export function CurrentUser() {
  const { viewer, logoutMutation } = useViewer();

  if (!viewer) {
    return <UserCircle className="text-base-content/40 size-6" aria-hidden />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>{getInitials(viewer.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 border-none p-3">
        <DropdownMenuSeparator />
        <div className="flex h-full w-full gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(viewer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex h-full w-full flex-col p-1">
            <span className="text-xs">{viewer.email}</span>
            <span className="text-xs">{viewer.name}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="flex h-full w-full items-center justify-center gap-3">
            <MutationButton
              className="btn-error"
              onClick={() => logoutMutation.mutate()}
              label="Logout"
              mutation={logoutMutation}
            />
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
