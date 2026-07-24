import { ListPagination } from "@/components/navigation/ListPagination";

interface JournalsPaginationProps {
  page: number;
  totalPages: number;
  className?: string;
}

/**
 * Journals index pagination (`/journals?page=`).
 */
export function JournalsPagination({ page, totalPages, className }: JournalsPaginationProps) {
  return (
    <ListPagination
      page={page}
      totalPages={totalPages}
      basePath="/journals"
      label="Journals pages"
      data-test="journals-pagination"
      className={className}
    />
  );
}
