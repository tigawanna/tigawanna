import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type TSRSearchNavigate<TSearch> = (opts: {
  search: (prev: TSearch) => TSearch;
  replace?: boolean;
  viewTransition?: boolean;
}) => void | Promise<void>;

interface UseTSRSearchQueryProps<TSearch extends Record<string, unknown>> {
  search: TSearch;
  navigate: TSRSearchNavigate<TSearch>;
  query_param: keyof TSearch & string;
  default_value?: string;
  debounce_delay?: number;
}

/**
 * Generic search query hook for TanStack Router routes.
 *
 * Keeps a local keyword input in sync with a debounced URL search param update.
 *
 * @example
 * const search = Route.useSearch();
 * const navigate = Route.useNavigate();
 * const { debouncedValue, isDebouncing, keyword, setKeyword, setSearchParams } = useTSRSearchQuery({
 *   search,
 *   navigate,
 *   query_param: "sq",
 * });
 */
export function useTSRSearchQuery<TSearch extends Record<string, unknown>>(
  opts: UseTSRSearchQueryProps<TSearch>,
) {
  const queryParam = opts.query_param;
  const debounceDelay = opts.debounce_delay ?? 500;
  const paramValue = opts.search[queryParam]
    ? String(opts.search[queryParam])
    : (opts.default_value ?? "");

  const [keyword, setKeywordState] = useState(paramValue);

  const debouncer = useDebouncer(
    (value: string) => {
      void opts.navigate({
        search: (prev) => ({
          ...prev,
          [queryParam]: value || undefined,
          ...("page" in prev ? { page: undefined } : {}),
        }),
        replace: true,
      });
    },
    { wait: debounceDelay },
    (state) => ({ isPending: state.isPending }),
  );

  useEffect(() => {
    setKeywordState(paramValue);
  }, [paramValue]);

  const setKeyword: Dispatch<SetStateAction<string>> = (value) => {
    setKeywordState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      debouncer.maybeExecute(next);
      return next;
    });
  };

  function setSearchParams(patch: Partial<TSearch>) {
    void opts.navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
      replace: true,
    });
  }

  return {
    debouncedValue: paramValue,
    isDebouncing: debouncer.state.isPending,
    keyword,
    setKeyword,
    setSearchParams,
  };
}
