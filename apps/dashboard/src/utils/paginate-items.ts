import { buildPaginatedResponse, type PaginatedResponse } from "@repo/db";

/**
 * Slices an in-memory list into a standard `{ items, pagination }` page.
 *
 * Useful for TanStack DB / client-filtered lists that already hold the full set.
 *
 * @param items - Full (already filtered/sorted) list.
 * @param page - 1-based page index.
 * @param perPage - Page size.
 */
export function paginateItems<T>(items: T[], page: number, perPage: number): PaginatedResponse<T> {
  const safePerPage = Math.max(1, Math.trunc(perPage));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePerPage));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);
  const start = (safePage - 1) * safePerPage;

  return buildPaginatedResponse({
    items: items.slice(start, start + safePerPage),
    page: safePage,
    perPage: safePerPage,
    totalItems,
  });
}
