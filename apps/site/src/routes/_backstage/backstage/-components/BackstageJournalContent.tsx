import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import { SearchBox } from "@/components/search/SearchBox";
import { deleteJournalEntry, setJournalEntryPinned } from "@/modules/journal/journal.functions";
import { filterAndSortJournalEntries } from "@/modules/journal/filter-sort-journal-entries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JournalEntryFormDialog } from "@/routes/_backstage/backstage/-components/JournalEntryFormDialog";
import {
  BackstageFilterField,
  BackstageFiltersDialog,
} from "@/routes/_backstage/backstage/-components/BackstageFiltersDialog";
import { useTSRSearchQuery } from "@/routes/_backstage/backstage/-hooks/use-tsr-search-query";
import { Route, type BackstageJournalSearch } from "@/routes/_backstage/backstage/journal";
import { unwrapUnknownError } from "@/utils/errors";
import { journalEntryTypeValues, type JournalEntryRow } from "@repo/db";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownAZ,
  ArrowUpZA,
  ExternalLink,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const journalSortOptions = [
  { value: "siteOrder", label: "Site order (pinned first)" },
  { value: "createdAt", label: "Created" },
  { value: "updatedAt", label: "Updated" },
  { value: "title", label: "Title" },
  { value: "type", label: "Type" },
] as const;

export function BackstageJournalContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { data: entries } = useSuspenseQuery(journalEntriesQueryOptions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryRow | null>(null);

  const { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams } =
    useTSRSearchQuery<BackstageJournalSearch>({
      search,
      navigate,
      query_param: "sq",
      debounce_delay: 400,
    });

  const sortBy = search.sortBy ?? "siteOrder";
  const sortDirection = search.sortDirection ?? "desc";
  const typeFilter = search.type ?? "all";
  const pinnedFilter = search.pinned ?? "all";

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (pinnedFilter !== "all" ? 1 : 0);

  const hasActiveFilters = Boolean(debouncedValue || activeFilterCount > 0);

  const visibleEntries = filterAndSortJournalEntries(entries, {
    query: debouncedValue,
    type: typeFilter,
    pinned: pinnedFilter,
    sortBy,
    sortDirection,
  });

  const setSortParams = (patch: Partial<BackstageJournalSearch>) => {
    startTransition(() => {
      void navigate({
        search: (prev) => ({ ...prev, ...patch }),
        replace: true,
        viewTransition: false,
      });
    });
  };

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
            Today-I-learned entries for the landing page and /lessons. Pinned entries show first on
            the site unless you choose a different sort order below.
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

      {entries.length > 0 ? (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1" data-test="backstage-journal-search">
            <SearchBox
              keyword={keyword}
              setKeyword={setKeyword}
              debouncedValue={debouncedValue}
              isDebouncing={isDebouncing}
              inputProps={{
                placeholder: "Search by title, description, or type…",
              }}
            />
          </div>
          <BackstageFiltersDialog
            data-test="backstage-journal-filters"
            activeFilterCount={activeFilterCount}
            onClear={() =>
              setSearchParams({
                type: undefined,
                pinned: undefined,
              })
            }
          >
            <BackstageFilterField label="Type">
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setSearchParams({
                    type: value === "all" ? undefined : (value as BackstageJournalSearch["type"]),
                  })
                }
              >
                <SelectTrigger className="w-full" data-test="backstage-journal-type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {journalEntryTypeValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </BackstageFilterField>
            <BackstageFilterField label="Pinned">
              <Select
                value={pinnedFilter}
                onValueChange={(value) =>
                  setSearchParams({
                    pinned:
                      value === "all" ? undefined : (value as BackstageJournalSearch["pinned"]),
                  })
                }
              >
                <SelectTrigger className="w-full" data-test="backstage-journal-pinned-filter">
                  <SelectValue placeholder="Pinned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entries</SelectItem>
                  <SelectItem value="pinned">Pinned only</SelectItem>
                  <SelectItem value="unpinned">Unpinned only</SelectItem>
                </SelectContent>
              </Select>
            </BackstageFilterField>
            <BackstageFilterField label="Sort by">
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortParams({
                    sortBy: value as BackstageJournalSearch["sortBy"],
                  })
                }
              >
                <SelectTrigger className="w-full" data-test="backstage-journal-sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {journalSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </BackstageFilterField>
            <BackstageFilterField label="Direction">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start gap-2"
                onClick={() =>
                  setSortParams({
                    sortDirection: sortDirection === "asc" ? "desc" : "asc",
                  })
                }
                data-test="backstage-journal-sort-direction"
              >
                {sortDirection === "asc" ? (
                  <>
                    <ArrowDownAZ className="size-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ArrowUpZA className="size-4" />
                    Descending
                  </>
                )}
              </Button>
            </BackstageFilterField>
          </BackstageFiltersDialog>
        </div>
      ) : null}

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
      ) : visibleEntries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matching entries</CardTitle>
            <CardDescription>Try a different search term or filter.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-base-content/50 text-sm" data-test="backstage-journal-results-count">
            {visibleEntries.length} {hasActiveFilters ? "matching" : ""}{" "}
            {visibleEntries.length === 1 ? "entry" : "entries"}
          </p>
          {visibleEntries.map((entry) => (
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
