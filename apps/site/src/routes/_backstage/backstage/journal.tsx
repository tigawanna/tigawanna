import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import { BackstageJournalContent } from "@/routes/_backstage/backstage/-components/BackstageJournalContent";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const backstageJournalSearchSchema = z.object({
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
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(journalEntriesQueryOptions),
  component: BackstageJournalPage,
});

function BackstageJournalPage() {
  return <BackstageJournalContent />;
}
