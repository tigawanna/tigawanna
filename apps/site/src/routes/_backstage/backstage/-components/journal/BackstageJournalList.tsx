import { TSRListPagination } from "@/components/pagination/TSRListPagination";
import { SearchBox } from "@/components/search/SearchBox";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  BACKSTAGE_LIST_PER_PAGE,
  journalEntriesQueryOptions,
} from "@/data-access-layer/backstage/shared-query-options";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, SearchX } from "lucide-react";
import { Route } from "../../journal";
import { BackstagePending } from "../shared/BackstagePending";
import { BackstageJournalListItem } from "./BackstageJournalListItem";
import { JournalEntryFormDialog } from "./JournalEntryFormDialog";

export function BackstageJournalList() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const page = search.page ?? 1;
  const queryClient = useQueryClient();
  const { data, isPending, isLoading } = useQuery(
    journalEntriesQueryOptions({ page, perPage: BACKSTAGE_LIST_PER_PAGE, q }),
  );

  const journalEntries = data?.items ?? [];
  const hasSearch = q.trim().length > 0;

  if (isPending || isLoading) {
    return (
      <BackstageJournalListScaffold>
        <BackstagePending />
      </BackstageJournalListScaffold>
    );
  }

  if (journalEntries.length === 0) {
    return (
      <BackstageJournalListScaffold totalPages={data?.pagination.totalPages ?? 0}>
        {hasSearch ? (
          <JournalSearchEmpty query={q.trim()} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>No Journal Entries Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any journals yet. Get started by creating your first
                journal entry.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <JournalEntryFormDialog onSuccess={() => invalidateJournalList(queryClient)} />
            </EmptyContent>
          </Empty>
        )}
      </BackstageJournalListScaffold>
    );
  }

  return (
    <BackstageJournalListScaffold totalPages={data?.pagination.totalPages ?? 0}>
      <ul
        className="flex h-[70vh] flex-col gap-3 overflow-y-auto"
        data-test="backstage-journal-list"
      >
        {journalEntries.map((entry) => (
          <BackstageJournalListItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </BackstageJournalListScaffold>
  );
}

function JournalSearchEmpty({ query }: { query: string }) {
  const { clearSearch } = usePageSearchQuery("/_backstage/backstage/journal");

  return (
    <Empty data-test="backstage-journal-search-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No entries match “{query}”</EmptyTitle>
        <EmptyDescription>
          Try clearing the search input or changing your keywords to find matching titles and
          descriptions.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={clearSearch}
          data-test="backstage-journal-clear-search"
        >
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface BackstageJournalListScaffoldProps {
  children: React.ReactNode;
  totalPages?: number;
}

/**
 * Invalidates journal-related queries after creating an entry from the list header.
 */
function invalidateJournalList(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: [queryKeyPrefixes.backstage, "journal-entries"],
  });
  void queryClient.invalidateQueries({
    queryKey: [queryKeyPrefixes.backstage, "dashboard-counts"],
  });
}

function BackstageJournalListScaffold({
  children,
  totalPages = 0,
}: BackstageJournalListScaffoldProps) {
  const queryClient = useQueryClient();
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(
    "/_backstage/backstage/journal",
  );

  return (
    <div className="flex min-h-full w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <p className="text-muted-foreground text-sm">
          Capture journal entries and keep them in sync.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchBox
            keyword={inputValue}
            setKeyword={(value) => onSearchChange(value)}
            isDebouncing={isDebouncing}
          />
        </div>
        <JournalEntryFormDialog onSuccess={() => invalidateJournalList(queryClient)} />
      </div>
      {children}
      <TSRListPagination routeID="/_backstage/backstage/journal" totalPages={totalPages} />
    </div>
  );
}
