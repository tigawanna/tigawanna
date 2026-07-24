import { ListPagination } from "@/components/navigation/ListPagination";

interface BlogsPaginationProps {
  page: number;
  totalPages: number;
  className?: string;
}

/**
 * Blogs index pagination (`/blogs?page=`).
 */
export function BlogsPagination({ page, totalPages, className }: BlogsPaginationProps) {
  return (
    <ListPagination
      page={page}
      totalPages={totalPages}
      basePath="/blogs"
      label="Blog pages"
      data-test="blogs-pagination"
      className={className}
    />
  );
}
