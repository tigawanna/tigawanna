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

type RepoRemoveButtonProps = {
  repoFullName: string;
  disabled?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
};

export function RepoRemoveButton({
  repoFullName,
  disabled,
  isPending,
  onConfirm,
}: RepoRemoveButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          data-test="remove-project"
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
        >
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {repoFullName} from projects?</AlertDialogTitle>
          <AlertDialogDescription>
            This only removes the repo from your projects database. The GitHub repository will not
            be deleted or changed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Removing…" : "Remove from projects"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
