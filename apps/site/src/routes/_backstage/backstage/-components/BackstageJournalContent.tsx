import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import { deleteJournalEntry, setJournalEntryPinned } from "@/lib/backstage/journal.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalEntryFormDialog } from "@/routes/_backstage/backstage/-components/JournalEntryFormDialog";
import { unwrapUnknownError } from "@/utils/errors";
import type { JournalEntryRow } from "@repo/db";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BackstageJournalContent() {
  const queryClient = useQueryClient();
  const { data: entries } = useSuspenseQuery(journalEntriesQueryOptions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryRow | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: journalEntriesQueryOptions.queryKey });
    void queryClient.invalidateQueries({ queryKey: ["lessons"] });
  };

  const pinMutation = useMutation({
    mutationFn: (input: { id: string; pinned: boolean }) => setJournalEntryPinned({ data: input }),
    onSuccess(row) {
      toast.success(row.pinned ? "Entry pinned" : "Entry unpinned");
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Failed to update pin", { description: unwrapUnknownError(err).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJournalEntry({ data: { id } }),
    onSuccess() {
      toast.success("Journal entry deleted");
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Failed to delete entry", { description: unwrapUnknownError(err).message });
    },
  });

  const openCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const openEdit = (entry: JournalEntryRow) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const confirmDelete = (entry: JournalEntryRow) => {
    if (!window.confirm(`Delete "${entry.title}"?`)) {
      return;
    }
    deleteMutation.mutate(entry.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6" data-test="backstage-journal">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
          <p className="text-base-content/60 mt-2 text-sm">
            Today-I-learned entries for the landing page and /lessons. Pinned entries show first;
            others sort by newest.
          </p>
        </div>
        <Button
          className="btn btn-primary btn-sm"
          onClick={openCreate}
          data-test="journal-add-button"
        >
          <Plus className="size-4" />
          Add entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No journal entries yet</CardTitle>
            <CardDescription>
              Create your first lesson or keep using static fallbacks until the database has rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="btn btn-primary btn-sm" onClick={openCreate}>
              Add entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-base-content/10 bg-base-200/40 p-5"
              data-test="journal-entry-row"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{entry.title}</h2>
                  <span className="rounded-full bg-base-content/10 px-2 py-0.5 text-xs uppercase">
                    {entry.type}
                  </span>
                  {entry.pinned ? (
                    <span
                      className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"
                      data-test="journal-entry-pinned-badge"
                    >
                      Pinned
                    </span>
                  ) : null}
                </div>
                {entry.description ? (
                  <p className="text-base-content/60 mt-2 text-sm leading-relaxed">
                    {entry.description}
                  </p>
                ) : null}
                <div className="text-base-content/45 mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <time>{format(new Date(entry.createdAt), "PPp")}</time>
                  <Link
                    to="/lessons/$lessonId"
                    params={{ lessonId: entry.id }}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View on site
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-base-content/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="btn btn-ghost btn-sm"
                  onClick={() => pinMutation.mutate({ id: entry.id, pinned: !entry.pinned })}
                  disabled={pinMutation.isPending}
                  data-test="journal-entry-pin-button"
                >
                  {entry.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  {entry.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEdit(entry)}
                  data-test="journal-entry-edit-button"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => confirmDelete(entry)}
                  disabled={deleteMutation.isPending}
                  data-test="journal-entry-delete-button"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <JournalEntryFormDialog
        key={editingEntry?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        onSuccess={invalidate}
      />
    </div>
  );
}
