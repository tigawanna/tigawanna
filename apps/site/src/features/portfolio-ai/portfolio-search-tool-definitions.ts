import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const portfolioRepoResultSchema = z.object({
  nameWithOwner: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  url: z.string(),
  homepageUrl: z.string().nullable(),
  openGraphImageUrl: z.string().nullable(),
  pushedAt: z.string().nullable(),
  isPrivate: z.boolean(),
  score: z.number(),
  matchType: z.enum(["semantic", "keyword"]),
});

export const portfolioSearchToolOutputSchema = z.object({
  query: z.string(),
  mode: z.enum(["semantic", "keyword", "empty-index"]),
  results: z.array(portfolioRepoResultSchema),
});

export const searchPortfolioReposToolDefinition = toolDefinition({
  name: "search_portfolio_repos",
  description:
    "Search Dennis's indexed GitHub repositories by intent using semantic similarity over names, descriptions, and tags.",
  inputSchema: z.object({
    query: z.string().trim().min(2).max(500),
    limit: z.coerce.number().int().min(1).max(12).default(6),
  }),
  outputSchema: portfolioSearchToolOutputSchema,
});
