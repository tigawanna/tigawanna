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
  contactMessagesQueryOptions,
} from "@/data-access-layer/backstage/shared-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Inbox, SearchX } from "lucide-react";
import { Route } from "../../messages";
import { BackstageMessageListItem } from "./BackstageMessageListItem";

const ROUTE_ID = "/_backstage/backstage/messages";

export function BackstageMessagesList() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const page = search.page ?? 1;
  const hasSearch = q.trim().length > 0;
  const { data } = useSuspenseQuery(
    contactMessagesQueryOptions({ page, perPage: BACKSTAGE_LIST_PER_PAGE, q }),
  );
  const messages = data.items;
  const totalPages = data.pagination.totalPages;

  if (messages.length === 0) {
    return (
      <BackstageMessagesListScaffold totalPages={0}>
        {hasSearch ? (
          <MessagesSearchEmpty query={q.trim()} />
        ) : (
          <Empty data-test="backstage-messages-empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No messages yet</EmptyTitle>
              <EmptyDescription>
                Contact form submissions sent to Telegram will show up here once they land in D1.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </BackstageMessagesListScaffold>
    );
  }

  return (
    <BackstageMessagesListScaffold totalPages={totalPages}>
      <div
        className="flex h-[70vh] flex-col gap-4 overflow-y-auto"
        data-test="backstage-messages-list"
      >
        {messages.map((message) => (
          <BackstageMessageListItem key={message.id} message={message} />
        ))}
      </div>
    </BackstageMessagesListScaffold>
  );
}

function MessagesSearchEmpty({ query }: { query: string }) {
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);

  return (
    <Empty data-test="backstage-messages-search-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No messages match “{query}”</EmptyTitle>
        <EmptyDescription>
          Try clearing the search or changing keywords to match name, contact, or message body.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={clearSearch}
          data-test="backstage-messages-clear-search"
        >
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface BackstageMessagesListScaffoldProps {
  children: React.ReactNode;
  totalPages?: number;
}

function BackstageMessagesListScaffold({
  children,
  totalPages = 0,
}: BackstageMessagesListScaffoldProps) {
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(ROUTE_ID);

  return (
    <div className="flex min-h-full w-full max-w-5xl flex-col gap-6" data-test="backstage-messages">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-sm">
          Contact submissions sent to Telegram and stored in D1.
        </p>
      </div>

      <div className="min-w-0" data-test="backstage-messages-search">
        <SearchBox
          keyword={inputValue}
          setKeyword={(value) => onSearchChange(value)}
          isDebouncing={isDebouncing}
          inputProps={{
            placeholder: "Search by name, contact, or message…",
          }}
        />
      </div>

      {children}

      <TSRListPagination routeID={ROUTE_ID} totalPages={totalPages} />
    </div>
  );
}
