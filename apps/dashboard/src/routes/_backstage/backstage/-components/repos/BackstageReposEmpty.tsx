import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { usePageSearchQuery } from "@/components/search/use-page-search-query";
import { SearchX } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const ROUTE_ID = "/_backstage/backstage/repos";

type BackstageReposEmptyProps = {
  hasActiveFilters: boolean;
  query: string;
};

export function BackstageReposEmpty({ hasActiveFilters, query }: BackstageReposEmptyProps) {
  const { clearSearch } = usePageSearchQuery(ROUTE_ID);

  if (hasActiveFilters) {
    return (
      <Empty data-test="backstage-repos-search-empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>
            {query ? `No repos match “${query}”` : "No repos match your filters"}
          </EmptyTitle>
          <EmptyDescription>
            Try clearing search or filters to see more repositories.
          </EmptyDescription>
        </EmptyHeader>
        {query ? (
          <EmptyContent>
            <Button
              type="button"
              variant="outline"
              onClick={clearSearch}
              data-test="backstage-repos-clear-search"
            >
              Clear search
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  return (
    <Empty data-test="backstage-repos-empty">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FaGithub />
        </EmptyMedia>
        <EmptyTitle>No repos found</EmptyTitle>
        <EmptyDescription>Refresh to pull your most recently pushed repositories.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
