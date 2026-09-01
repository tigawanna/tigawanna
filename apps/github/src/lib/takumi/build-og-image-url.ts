import { AppConfig } from "@/utils/system";

export interface JournalOgImageParams {
  title: string;
  description?: string;
  type?: string;
}

/**
 * Builds an absolute Takumi OG image URL for a journal/lesson share card.
 */
export function buildJournalOgImageUrl({ title, description, type }: JournalOgImageParams): string {
  const url = new URL("/og", AppConfig.links.website);
  url.searchParams.set("title", title);
  if (description?.trim()) {
    url.searchParams.set("description", description.trim());
  }
  if (type?.trim()) {
    url.searchParams.set("type", type.trim());
  }
  return url.toString();
}
