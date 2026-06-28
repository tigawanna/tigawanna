import { contactMessagesQueryOptions } from "@/data-access-layer/backstage/query-options";
import { journalEntriesQueryOptions } from "@/data-access-layer/backstage/journal-query-options";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
} from "@/data-access-layer/backstage/projects-query-options";
import {
  projectEnrichmentRunsQueryOptions,
  projectEnrichmentSuggestionsQueryOptions,
} from "@/data-access-layer/backstage/projects-enrichment-query-options";
import { BackstageHomeContent } from "@/routes/_backstage/backstage/-components/home/BackstageHomeContent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(contactMessagesQueryOptions),
      context.queryClient.ensureQueryData(journalEntriesQueryOptions),
      context.queryClient.ensureQueryData(backstageProjectsQueryOptions),
      context.queryClient.ensureQueryData(backstageGithubReposQueryOptions),
      context.queryClient.ensureQueryData(projectEnrichmentSuggestionsQueryOptions),
      context.queryClient.ensureQueryData(projectEnrichmentRunsQueryOptions),
    ]),
  component: BackstageHomePage,
});

function BackstageHomePage() {
  return <BackstageHomeContent />;
}
