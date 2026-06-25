import {
  searchPortfolioReposInternal,
  portfolioSearchInputSchema,
} from "@/lib/portfolio/search-core";
import { createServerFn } from "@tanstack/react-start";

export const searchPortfolioRepos = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => portfolioSearchInputSchema.parse(input))
  .handler(async ({ data }) => searchPortfolioReposInternal(data));
