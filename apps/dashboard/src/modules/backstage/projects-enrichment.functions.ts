import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  approveProjectEnrichmentSuggestion as approveProjectEnrichmentSuggestionImpl,
  getProjectEnrichmentRun as getProjectEnrichmentRunImpl,
  listProjectEnrichmentRuns as listProjectEnrichmentRunsImpl,
  listProjectEnrichmentSuggestions as listProjectEnrichmentSuggestionsImpl,
  rejectProjectEnrichmentSuggestion as rejectProjectEnrichmentSuggestionImpl,
  triggerProjectEnrichmentRun as triggerProjectEnrichmentRunImpl,
  type ProjectEnrichmentSuggestionListItem,
} from "@/modules/backstage/projects-enrichment.server";
import type { PaginatedResponse, ProjectEnrichmentRunRow } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type { ProjectEnrichmentSuggestionListItem };

const listPaginationInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
  })
  .optional();

export const listProjectEnrichmentSuggestions = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listPaginationInputSchema>) =>
    listPaginationInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectEnrichmentSuggestionListItem>> => {
    await requireBackstageSession();
    return listProjectEnrichmentSuggestionsImpl(data);
  });

export const listProjectEnrichmentRuns = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listPaginationInputSchema>) =>
    listPaginationInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectEnrichmentRunRow>> => {
    await requireBackstageSession();
    return listProjectEnrichmentRunsImpl(data);
  });

export const getProjectEnrichmentRun = createServerFn({ method: "GET" })
  .validator((input: { runId: string }) => ({
    runId: z.string().uuid().parse(input.runId),
  }))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return getProjectEnrichmentRunImpl(data.runId);
  });

export const approveProjectEnrichmentSuggestion = createServerFn({ method: "POST" })
  .validator(
    (input: {
      suggestionId: string;
      description: string;
      homepage?: string | null;
      topics: string[];
      enrichedSummary?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return approveProjectEnrichmentSuggestionImpl(data);
  });

export const rejectProjectEnrichmentSuggestion = createServerFn({ method: "POST" })
  .validator((input: { suggestionId: string }) => input)
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return rejectProjectEnrichmentSuggestionImpl(data.suggestionId);
  });

const triggerEnrichmentInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  repos: z.array(z.string().regex(/^[^/]+\/[^/]+$/)).optional(),
  force: z.boolean().optional(),
});

export const triggerProjectEnrichmentRun = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof triggerEnrichmentInputSchema>) =>
    triggerEnrichmentInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return triggerProjectEnrichmentRunImpl(data);
  });
