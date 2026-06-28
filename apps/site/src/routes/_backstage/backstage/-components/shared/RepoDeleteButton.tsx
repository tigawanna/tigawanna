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
import { Trash2 } from "lucide-react";

type RepoDeleteButtonProps = {
  repoFullName: string;
  disabled?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
};

export function RepoDeleteButton({
  repoFullName,
  disabled,
  isPending,
  onConfirm,
}: RepoDeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          data-test="delete-repo"
          variant="destructive"
          size="sm"
          disabled={disabled || isPending}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {repoFullName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the repository on GitHub and removes it from projects. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending ? "Deleting…" : "Delete repo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
