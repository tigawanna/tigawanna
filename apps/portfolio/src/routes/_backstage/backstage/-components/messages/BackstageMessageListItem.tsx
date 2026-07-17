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
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { deleteContactMessage } from "@/modules/backstage/contact-messages.functions";
import { unwrapUnknownError } from "@/utils/errors";
import type { ContactMessageRow } from "@repo/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BackstageMessageListItemProps {
  message: ContactMessageRow;
}

/**
 * Single contact message row with confirm-to-delete controls.
 */
export function BackstageMessageListItem({ message }: BackstageMessageListItemProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess() {
      toast.success("Message deleted");
      void queryClient.invalidateQueries({
        queryKey: [queryKeyPrefixes.backstage, "contact-messages"],
      });
      void queryClient.invalidateQueries({
        queryKey: [queryKeyPrefixes.backstage, "dashboard-counts"],
      });
    },
    onError(err: unknown) {
      toast.error("Failed to delete message", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  return (
    <article
      className="rounded-xl border border-base-content/10 bg-base-200/40 p-5"
      data-test="contact-message-row"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{message.name}</p>
          {message.contact ? (
            <p className="text-base-content/60 text-sm">{message.contact}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <time className="text-base-content/45 text-xs">
            {format(new Date(message.createdAt), "PPp")}
          </time>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-error"
                disabled={deleteMutation.isPending}
                aria-label={`Delete message from ${message.name}`}
                data-test="contact-message-delete-button"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-test="contact-message-delete-dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete message from “{message.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the contact submission from D1. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(message.id)}
                  data-test="contact-message-delete-confirm"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete message"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
      <div className="text-base-content/40 mt-3 flex flex-wrap gap-3 text-xs">
        {message.telegramSent ? <span>Telegram sent</span> : <span>Telegram failed</span>}
        {message.ipAddress ? <span>IP: {message.ipAddress}</span> : null}
      </div>
    </article>
  );
}
