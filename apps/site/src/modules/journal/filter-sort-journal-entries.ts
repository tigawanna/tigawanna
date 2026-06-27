import type { JournalEntryRow } from "@repo/db";
import { compareJournalEntriesForDisplay } from "@/modules/journal/map-journal-row";

export type JournalSortBy = "siteOrder" | "createdAt" | "updatedAt" | "title" | "type";

export type JournalPinnedFilter = "all" | "pinned" | "unpinned";

export type JournalTypeFilter = "all" | JournalEntryRow["type"];

export interface JournalListFilters {
  query: string;
  type: JournalTypeFilter;
  pinned: JournalPinnedFilter;
  sortBy: JournalSortBy;
  sortDirection: "asc" | "desc";
}

function matchesQuery(entry: JournalEntryRow, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [entry.title, entry.description, entry.markdown, entry.type, entry.gist ?? ""]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function filterJournalEntries(
  entries: JournalEntryRow[],
  { query, type, pinned }: Pick<JournalListFilters, "query" | "type" | "pinned">,
) {
  return entries.filter((entry) => {
    if (pinned === "pinned" && !entry.pinned) {
      return false;
    }
    if (pinned === "unpinned" && entry.pinned) {
      return false;
    }
    if (type !== "all" && entry.type !== type) {
      return false;
    }
    return matchesQuery(entry, query);
  });
}

export function sortJournalEntries(
  entries: JournalEntryRow[],
  sortBy: JournalSortBy,
  sortDirection: "asc" | "desc",
) {
  if (sortBy === "siteOrder") {
    return [...entries].sort(compareJournalEntriesForDisplay);
  }

  const direction = sortDirection === "asc" ? 1 : -1;
  return [...entries].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return direction * a.title.localeCompare(b.title);
      case "type":
        return direction * a.type.localeCompare(b.type);
      case "updatedAt":
        return direction * (a.updatedAt.getTime() - b.updatedAt.getTime());
      case "createdAt":
        return direction * (a.createdAt.getTime() - b.createdAt.getTime());
      default:
        return 0;
    }
  });
}

export function filterAndSortJournalEntries(
  entries: JournalEntryRow[],
  filters: JournalListFilters,
) {
  const filtered = filterJournalEntries(entries, filters);
  return sortJournalEntries(filtered, filters.sortBy, filters.sortDirection);
}
