import { TRouteID } from "@/lib/tanstack/router/router-types";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function usePageSearchQuery(routeID: TRouteID) {
  const SEARCH_DEBOUNCE_MS = 3000;
  const journalRouteApi = getRouteApi(routeID);
  const routeSearch = journalRouteApi.useSearch();
  const navigate = journalRouteApi.useNavigate();
  const searchQuery = "q" in routeSearch ? (routeSearch.q ?? "") : "";
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const commitSearch = useDebouncedCallback(
    (value: string) => {
      const trimmed = value.trim();
      void navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed.length > 0 ? trimmed : undefined,
          page: undefined,
        }),
        replace: true,
      });
    },
    { wait: SEARCH_DEBOUNCE_MS },
  );

  function onSearchChange(value: string) {
    setInputValue(value);
    commitSearch(value);
  }

  /**
   * Clears the search input and URL `q` immediately (no debounce).
   */
  function clearSearch() {
    setInputValue("");
    void navigate({
      search: (prev) => ({
        ...prev,
        q: undefined,
        page: undefined,
      }),
      replace: true,
    });
  }

  const isDebouncing = inputValue.trim() !== searchQuery;

  return { inputValue, onSearchChange, clearSearch, isDebouncing };
}
