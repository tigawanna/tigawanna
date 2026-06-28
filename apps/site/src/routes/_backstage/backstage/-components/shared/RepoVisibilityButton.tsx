import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type RepoVisibilityButtonProps = {
  repoFullName: string;
  isPrivate: boolean;
  disabled?: boolean;
  isPending?: boolean;
  onConfirm: (visibility: "public" | "private") => void;
};

export function RepoVisibilityButton({
  repoFullName,
  isPrivate,
  disabled,
  isPending,
  onConfirm,
}: RepoVisibilityButtonProps) {
  const nextVisibility = isPrivate ? "public" : "private";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          data-test="repo-visibility-toggle"
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
        >
          {isPrivate ? "Private" : "Public"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Make {repoFullName} {nextVisibility}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This repository is currently {isPrivate ? "private" : "public"}. Confirm to make it{" "}
            {nextVisibility} on GitHub.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={() => onConfirm(nextVisibility)}>
            {isPending ? "Updating…" : `Make ${nextVisibility}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
