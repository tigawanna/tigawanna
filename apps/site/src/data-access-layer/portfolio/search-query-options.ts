import { searchPortfolioRepos } from "@/lib/portfolio/search-repos";
import { queryOptions } from "@tanstack/react-query";

export const portfolioSearchQueryOptions = (query: string, apiKey?: string) =>
  queryOptions({
    queryKey: ["portfolio", "search", query, apiKey ? "byok" : "server"],
    queryFn: () => searchPortfolioRepos({ data: { query, apiKey } }),
    enabled: query.trim().length >= 2,
  });
