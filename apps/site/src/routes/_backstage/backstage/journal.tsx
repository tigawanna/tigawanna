import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { BackstageJournalContent } from "@/routes/_backstage/backstage/-components/journal/BackstageJournalContent";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const backstageJournalSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  sq: z.string().optional(),
  sortBy: z.enum(["siteOrder", "createdAt", "updatedAt", "title", "type"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  type: z.enum(["all", "TIL", "til", "note", "CHALLENGE"]).optional(),
  pinned: z.enum(["all", "pinned", "unpinned"]).optional(),
});

export type BackstageJournalSearch = z.infer<typeof backstageJournalSearchSchema>;

export const Route = createFileRoute("/_backstage/backstage/journal")({
  validateSearch: (search) => backstageJournalSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps: { page } }) =>
    context.queryClient.ensureQueryData(journalEntriesQueryOptions(page)),
  component: BackstageJournalPage,
});

function BackstageJournalPage() {
  return <BackstageJournalContent />;
}
