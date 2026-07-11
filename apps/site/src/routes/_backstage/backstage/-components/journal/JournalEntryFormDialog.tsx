import { useAppForm } from "@/lib/tanstack/form";
import {
  journalEntryFormDefaults,
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "@/modules/journal/journal-form-schema";
import {
  createJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
} from "@/modules/journal/journal.functions";
import { journalEntryTypeValues, type JournalEntryRow } from "@repo/db";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { unwrapUnknownError } from "@/utils/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { z } from "zod";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

const formOpts = formOptions({
  defaultValues: journalEntryFormDefaults,
});

function rowToFormValues(row: JournalEntryRow): JournalEntryFormValues {
  return {
    title: row.title,
    description: row.description,
    markdown: row.markdown,
    richtext: row.richtext,
    gist: row.gist ?? "",
    type: row.type,
  };
}

interface JournalEntryFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  entry?: JournalEntryRow | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function JournalEntryFormDialog({
  open: openProp = false,
  onOpenChange: onOpenChangeProp = () => {},
  entry,
  onSuccess,
  trigger,
}: JournalEntryFormDialogProps) {
  const isEditing = entry != null;
  const [open, setOpen] = useState(openProp);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChangeProp?.(nextOpen);
  }

  const mutation = useMutation({
    mutationFn: async (value: JournalEntryFormValues) => {
      if (isEditing) {
        return updateJournalEntry({ data: { ...value, id: entry.id } });
      }
      return createJournalEntry({ data: value });
    },
    onSuccess() {
      toast.success(isEditing ? "Journal entry updated" : "Journal entry created");
      onSuccess?.();
      handleOpenChange(false);
    },
    onError(err: unknown) {
      toast.error(isEditing ? "Failed to update entry" : "Failed to create entry", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJournalEntry({ data: { id } }),
    onSuccess() {
      toast.success("Journal entry deleted");
      onSuccess?.();
      handleOpenChange(false);
    },
    onError(err: unknown) {
      toast.error("Failed to delete entry", {
        description: unwrapUnknownError(err).message,
      });
    },
  });

  const form = useAppForm({
    ...formOpts,
    defaultValues: entry ? rowToFormValues(entry) : journalEntryFormDefaults,
    validators: {
      onSubmit: journalEntryFormSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger === null ? null : trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">{isEditing ? <Pencil /> : <Plus />}</Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        data-test="journal-entry-dialog"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit journal entry" : "Add journal entry"}</DialogTitle>
          <DialogDescription>
            Lessons shown on the landing page and /lessons. Pinned entries appear first.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
          data-test="journal-entry-form"
        >
          <form.AppField
            name="title"
            validators={{ onChange: z.string().min(1, "Title is required") }}
          >
            {(field) => <field.TextField label="Title" placeholder="What did you learn?" />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextAreaField
                label="Description"
                placeholder="Short summary for cards and SEO"
              />
            )}
          </form.AppField>

          <form.AppField name="type">
            {(field) => (
              <field.SelectField
                label="Type"
                items={journalEntryTypeValues.map((value) => ({
                  value,
                  label: value.toUpperCase(),
                }))}
              />
            )}
          </form.AppField>

          <form.AppField name="gist">
            {(field) => (
              <field.TextField
                label="Gist URL (optional)"
                placeholder="https://gist.github.com/..."
              />
            )}
          </form.AppField>

          <form.AppField name="markdown">
            {(field) => (
              <field.TextAreaField
                label="Markdown"
                placeholder="Full lesson content in markdown"
                className="min-h-48 font-mono text-sm"
              />
            )}
          </form.AppField>

          <form.AppField name="richtext">
            {(field) => (
              <field.TextAreaField
                label="Rich text (optional)"
                placeholder="Legacy rich text field"
              />
            )}
          </form.AppField>

          <DialogFooter className="gap-2 sm:justify-between">
            {isEditing ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-error mr-auto"
                    disabled={deleteMutation.isPending}
                    data-test="journal-entry-delete-button"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-test="journal-entry-delete-dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete “{entry.title}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the journal entry. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(entry.id)}
                    >
                      {deleteMutation.isPending ? "Deleting…" : "Delete entry"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <form.AppForm>
                <form.SubmitButton
                  label={isEditing ? "Save changes" : "Create entry"}
                  className="btn btn-primary"
                />
              </form.AppForm>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
