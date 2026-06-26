import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function CurrentUser() {
  const { viewer, logoutMutation } = useViewer();

  if (!viewer?.user) {
    return <UserCircle className="text-base-content/40 size-6" aria-hidden />;
  }

  const avatarUrl = viewer.user.image ?? "/blank-user.png";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={avatarUrl} alt={viewer.user.name} />
          <AvatarFallback>{viewer.user.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 border-none p-3">
        <DropdownMenuSeparator />
        <div className="flex h-full w-full gap-3">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={viewer.user.name} />
            <AvatarFallback>{viewer.user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex h-full w-full flex-col p-1">
            <span className="text-xs">{viewer.user.email}</span>
            <span className="text-xs">{viewer.user.name}</span>
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
