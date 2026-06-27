import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import { BackstageJournalContent } from "@/routes/_backstage/backstage/-components/BackstageJournalContent";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/journal")({
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
