import { useAppForm } from "@/lib/tanstack/form";
import {
  journalEntryFormDefaults,
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "@/modules/journal/journal-form-schema";
import { createJournalEntry, updateJournalEntry } from "@/modules/journal/journal.functions";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntryRow | null;
  onSuccess: () => void;
}

export function JournalEntryFormDialog({
  open,
  onOpenChange,
  entry,
  onSuccess,
}: JournalEntryFormDialogProps) {
  const isEditing = entry != null;

  const mutation = useMutation({
    mutationFn: async (value: JournalEntryFormValues) => {
      if (isEditing) {
        return updateJournalEntry({ data: { ...value, id: entry.id } });
      }
      return createJournalEntry({ data: value });
    },
    onSuccess() {
      toast.success(isEditing ? "Journal entry updated" : "Journal entry created");
      onSuccess();
      onOpenChange(false);
    },
    onError(err: unknown) {
      toast.error(isEditing ? "Failed to update entry" : "Failed to create entry", {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton
                label={isEditing ? "Save changes" : "Create entry"}
                className="btn btn-primary"
              />
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
