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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LESSONS_LIST_PER_PAGE,
  lessonsListQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";
import { LessonCard } from "@/routes/-components/landing/cards/LessonCard";
import { PortfolioGridSkeleton } from "@/routes/-components/landing/cards/PortfolioGridSkeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, SearchX } from "lucide-react";
import { Suspense } from "react";
import { Route } from "../index";

const ROUTE_ID = "/lessons/";

export function LessonsList() {
  return (
    <Suspense
      fallback={
        <LessonsListScaffold totalPages={0}>
          <PortfolioGridSkeleton count={6} />
        </LessonsListScaffold>
      }
    >
      <LessonsListContent />
    </Suspense>
  );
}

function LessonsListContent() {
  const search = Route.useSearch();
  const q = search.q ?? "";
  const page = search.page ?? 1;
  const sortBy = search.sortBy ?? "latest";
  const hasSearch = q.trim().length > 0;

  const { data: lessons } = useSuspenseQuery(
    lessonsListQueryOptions({
      page,
      perPage: LESSONS_LIST_PER_PAGE,
      q,
      sortBy,
    }),
  );

  if (lessons.items.length === 0) {
    if (hasSearch) {
      return (
        <LessonsListScaffold totalPages={0}>
          <LessonsSearchEmpty query={q.trim()} />
        </LessonsListScaffold>
      );
    }

    return (
      <LessonsListScaffold totalPages={0}>
        <LessonsEmpty />
      </LessonsListScaffold>
    );
  }

  return (
    <LessonsListScaffold totalPages={lessons.totalPages}>
      <ul
        className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-test="lessons-grid"
      >
        {lessons.items.map((item, index) => (
          <li key={item.id}>
            <LessonCard item={item} tone={(index % 3) as 0 | 1 | 2} />
          </li>
        ))}
      </ul>
    </LessonsListScaffold>
  );
}

function LessonsEmpty() {
  return (
    <Empty data-test="lessons-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen />
        </EmptyMedia>
        <EmptyTitle>No lessons yet</EmptyTitle>
        <EmptyDescription>
          Journal entries will show up here once they&apos;re published.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function LessonsSearchEmpty({ query }: { query: string }) {
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);

  return (
    <Empty data-test="lessons-search-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No lessons match “{query}”</EmptyTitle>
        <EmptyDescription>
          Try clearing the search or changing keywords to match titles and descriptions.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={clearSearch}
          data-test="lessons-clear-search"
        >
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface LessonsListScaffoldProps {
  children: React.ReactNode;
  totalPages?: number;
}

function LessonsListScaffold({ children, totalPages = 0 }: LessonsListScaffoldProps) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { inputValue, onSearchChange, isDebouncing } = usePageSearchQuery(ROUTE_ID);
  const sortBy = search.sortBy ?? "latest";

  function onSortChange(value: string) {
    if (value !== "latest" && value !== "oldest") {
      return;
    }

    void navigate({
      search: (prev) => {
        if (value === "latest") {
          return {
            ...prev,
            sortBy: undefined,
            page: undefined,
          };
        }

        return {
          ...prev,
          sortBy: value,
          page: undefined,
        };
      },
      replace: true,
    });
  }

  return (
    <div className="flex w-full flex-col gap-6" data-test="lessons-list">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1" data-test="lessons-search">
          <SearchBox
            keyword={inputValue}
            setKeyword={(value) => onSearchChange(value)}
            isDebouncing={isDebouncing}
            inputProps={{
              placeholder: "Search lessons…",
            }}
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-full sm:w-40" data-test="lessons-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {children}

      <TSRListPagination
        routeID={ROUTE_ID}
        totalPages={totalPages}
        data-test="lessons-pagination"
      />
    </div>
  );
}
