import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { BackstageJournalList } from "./-components/journal/BackstageJournalList";
import { BackstagePending } from "./-components/shared/BackstagePending";

export const backstageJournalSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
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
    context.queryClient.ensureQueryData(journalEntriesQueryOptions({ page })),
  component: BackstageJournalPage,
  pendingComponent: BackstagePending,
});

function BackstageJournalPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen ">
      <BackstageJournalList />
    </div>
  );
}
