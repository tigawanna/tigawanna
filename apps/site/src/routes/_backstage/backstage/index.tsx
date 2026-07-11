import {
  projectEnrichmentRunsQueryOptions,
  projectEnrichmentSuggestionsQueryOptions,
} from "@/data-access-layer/backstage/enrich/projects-enrichment-query-options";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
} from "@/data-access-layer/backstage/projects/projects-query-options";
import {
  contactMessagesQueryOptions,
  journalEntriesQueryOptions,
} from "@/data-access-layer/backstage/shared-query-options";
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
