import type { UIMessage } from "@tanstack/ai-react";
import type { RepoSearchResult } from "@/types/portfolio-search";
import { portfolioSearchToolOutputSchema } from "@/features/portfolio-ai/portfolio-search-tool-definitions";

function parseSearchToolOutput(output: unknown) {
  const parsed = portfolioSearchToolOutputSchema.safeParse(output);
  return parsed.success ? parsed.data.results : [];
}

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text",
    )
    .map((part) => part.content)
    .join("\n")
    .trim();
}

export function extractPortfolioSearchResults(messages: UIMessage[]) {
  const collected: RepoSearchResult[] = [];

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool-call" && part.name === "search_portfolio_repos" && part.output) {
        for (const result of parseSearchToolOutput(part.output)) {
          if (!collected.some((item) => item.nameWithOwner === result.nameWithOwner)) {
            collected.push(result);
          }
        }
      }

      if (part.type === "tool-result" && "content" in part) {
        const content = part.content;
        if (typeof content !== "object" || content === null) {
          continue;
        }

        for (const result of parseSearchToolOutput(content)) {
          if (!collected.some((item) => item.nameWithOwner === result.nameWithOwner)) {
            collected.push(result);
          }
        }
      }
    }
  }

  return collected.sort((left, right) => right.score - left.score);
}
