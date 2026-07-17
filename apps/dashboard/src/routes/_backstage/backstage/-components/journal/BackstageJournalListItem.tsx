import { Button } from "@/components/ui/button";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { setJournalEntryPinned } from "@/modules/journal/journal.functions";
import { unwrapUnknownError } from "@/utils/errors";
import type { JournalEntryRow } from "@repo/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ExternalLink, Pencil, Pin, PinOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { JournalEntryFormDialog } from "./JournalEntryFormDialog";

interface BackstageJournalListItemProps {
  entry: JournalEntryRow;
}

function invalidateJournalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: [queryKeyPrefixes.backstage, "journal-entries"],
  });
  void queryClient.invalidateQueries({
    queryKey: [queryKeyPrefixes.backstage, "dashboard-counts"],
  });
  void queryClient.invalidateQueries({ queryKey: ["lessons"] });
}

export function BackstageJournalListItem({ entry }: BackstageJournalListItemProps) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const pinMutation = useMutation({
    mutationFn: (input: { id: string; pinned: boolean }) => setJournalEntryPinned({ data: input }),
    onSuccess(row) {
      toast.success(row.pinned ? "Entry pinned" : "Entry unpinned");
      invalidateJournalQueries(queryClient);
    },
    onError(err: unknown) {
      toast.error("Failed to update pin", { description: unwrapUnknownError(err).message });
    },
  });

  return (
    <li>
      <article
        className="group rounded-2xl bg-base-300/40 px-4 py-4 transition-colors hover:bg-base-300/60 sm:px-5"
        data-test="journal-entry-row"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-medium tracking-tight">{entry.title}</h2>
          <span className="rounded-md bg-base-content/8 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-base-content/60 uppercase">
            {entry.type}
          </span>
          {entry.pinned ? (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              data-test="journal-entry-pinned-badge"
            >
              <Pin className="size-2.5" />
              Pinned
            </span>
          ) : null}
        </div>

        {entry.description ? (
          <p className="text-base-content/55 mt-1.5 line-clamp-2 text-sm leading-relaxed">
            {entry.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-base-content/40 flex flex-wrap items-center gap-3 text-xs">
            <time dateTime={new Date(entry.createdAt).toISOString()}>
              {format(new Date(entry.createdAt), "MMM d, yyyy")}
            </time>
            <Link
              to="/lessons/$lessonId"
              params={{ lessonId: entry.id }}
              target="_blank"
              className="inline-flex items-center gap-1 text-primary/80 hover:text-primary hover:underline"
            >
              View
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() => pinMutation.mutate({ id: entry.id, pinned: !entry.pinned })}
              disabled={pinMutation.isPending}
              data-test="journal-entry-pin-button"
            >
              {entry.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              {entry.pinned ? "Unpin" : "Pin"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() => setEditOpen(true)}
              data-test="journal-entry-edit-button"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </article>

      {editOpen ? (
        <JournalEntryFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          entry={entry}
          onSuccess={() => invalidateJournalQueries(queryClient)}
          trigger={null}
        />
      ) : null}
    </li>
  );
}
