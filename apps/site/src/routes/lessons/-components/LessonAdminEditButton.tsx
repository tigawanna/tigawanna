import { Button } from "@/components/ui/button";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { journalEntryByIdQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { JournalEntryFormDialog } from "@/routes/_backstage/backstage/-components/journal/JournalEntryFormDialog";
import { unwrapUnknownError } from "@/utils/errors";
import type { JournalEntryRow } from "@repo/db";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LessonAdminEditButtonProps {
  lessonId: string;
}

/**
 * Admin-only edit control for a public lesson page.
 * Opens the journal entry dialog when the lesson exists in the database.
 */
export function LessonAdminEditButton({ lessonId }: LessonAdminEditButtonProps) {
  const { isAdmin } = useViewer();
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState<JournalEntryRow | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAdmin) {
    return null;
  }

  async function handleEdit() {
    setIsLoading(true);
    try {
      const row = await queryClient.fetchQuery(journalEntryByIdQueryOptions(lessonId));
      if (!row) {
        toast.error("This lesson is not editable", {
          description: "Only journal entries stored in the database can be edited.",
        });
        return;
      }
      setEntry(row);
      setOpen(true);
    } catch (err: unknown) {
      toast.error("Failed to load entry", {
        description: unwrapUnknownError(err).message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-base-content/70 hover:text-base-content"
        onClick={() => void handleEdit()}
        disabled={isLoading}
        data-test="lesson-admin-edit-button"
      >
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Pencil className="size-3.5" />
        )}
        Edit
      </Button>

      {open && entry ? (
        <JournalEntryFormDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEntry(null);
          }}
          entry={entry}
          trigger={null}
          onSuccess={() => {
            void queryClient.invalidateQueries({
              queryKey: [queryKeyPrefixes.backstage, "journal-entries"],
            });
            void queryClient.invalidateQueries({
              queryKey: [queryKeyPrefixes.backstage, "journal-entry", lessonId],
            });
            void queryClient.invalidateQueries({ queryKey: ["lessons"] });
          }}
        />
      ) : null}
    </>
  );
}
