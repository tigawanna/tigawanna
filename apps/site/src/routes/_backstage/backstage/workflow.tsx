import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  projectEnrichmentRunsQueryOptions,
  projectEnrichmentSuggestionsQueryOptions,
  projectReposQueryOptions,
} from "@/data-access-layer/backstage/projects-enrichment-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { EnrichmentRunRow } from "./-components/enrichment/EnrichmentRunRow";
import { StartEnrichmentDialog } from "./-components/enrichment/StartEnrichmentDialog";
import { SuggestionReviewCard } from "./-components/enrichment/SuggestionReviewCard";

type RunFilter = "all" | "running" | "completed" | "failed";

function filterRuns<T extends { status: string }>(runs: T[], filter: RunFilter) {
  if (filter === "all") {
    return runs;
  }
  return runs.filter((run) => run.status === filter);
}

export const Route = createFileRoute("/_backstage/backstage/workflow")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectEnrichmentSuggestionsQueryOptions),
      context.queryClient.ensureQueryData(projectReposQueryOptions),
      context.queryClient.ensureQueryData(projectEnrichmentRunsQueryOptions),
    ]),
  component: BackstageWorkflowPage,
});

function BackstageWorkflowPage() {
  const queryClient = useQueryClient();
  const { data: suggestions } = useSuspenseQuery(projectEnrichmentSuggestionsQueryOptions);
  const { data: repos } = useSuspenseQuery(projectReposQueryOptions);
  const { data: runs } = useSuspenseQuery({
    ...projectEnrichmentRunsQueryOptions,
    refetchInterval: (query) =>
      query.state.data?.some((run) => run.status === "running") ? 5000 : false,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["backstage", "project-enrichment"],
    });
  };

  const runningCount = runs.filter((run) => run.status === "running").length;
  const completedCount = runs.filter((run) => run.status === "completed").length;
  const failedCount = runs.filter((run) => run.status === "failed").length;
  const completeRepoCount = repos.filter((repo) => repo.attendance === "complete").length;

  const runTabs: Array<{ value: RunFilter; label: string; count: number }> = [
    { value: "all", label: "All", count: runs.length },
    { value: "running", label: "Running", count: runningCount },
    { value: "completed", label: "Completed", count: completedCount },
    { value: "failed", label: "Failed", count: failedCount },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-workflow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow</h1>
          <p className="text-base-content/60 mt-2 text-sm">
            {repos.length} tracked repos · {completeRepoCount} complete on GitHub ·{" "}
            {suggestions.length} pending review
          </p>
        </div>
        <StartEnrichmentDialog trackedRepos={repos} onRunStarted={invalidate} />
      </div>

      <Card data-test="enrichment-runs">
        <CardHeader>
          <CardTitle>Enrichment runs</CardTitle>
          <CardDescription>
            {runningCount > 0
              ? `${runningCount} run${runningCount === 1 ? "" : "s"} in progress`
              : "History of discovery and enrichment jobs"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="border-b border-base-content/10 px-4 pt-2">
              <TabsList variant="line">
                {runTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-test={`enrichment-runs-tab-${tab.value}`}
                  >
                    {tab.label} ({tab.count})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {runTabs.map((tab) => {
              const filtered = filterRuns(runs, tab.value);

              return (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {filtered.length === 0 ? (
                    <p className="text-base-content/50 px-4 py-8 text-sm">
                      {tab.value === "all"
                        ? "No runs yet. Start one to discover or enrich repos."
                        : `No ${tab.value} runs.`}
                    </p>
                  ) : (
                    <div className="divide-base-content/10 divide-y">
                      {filtered.map((run) => (
                        <EnrichmentRunRow key={run.id} run={run} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Pending review</h2>
          {suggestions.map((suggestion) => (
            <SuggestionReviewCard key={suggestion.id} suggestion={suggestion} onDone={invalidate} />
          ))}
        </div>
      ) : (
        <p className="text-base-content/50 text-sm">No suggestions waiting for review.</p>
      )}

      {repos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tracked repos</CardTitle>
            <CardDescription>Repos synced from previous enrichment runs.</CardDescription>
          </CardHeader>
          <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
            {repos.map((repo) => (
              <div key={repo.githubRepoId} className="px-4 py-3" data-test="tracked-repo-row">
                <p className="font-medium">{repo.repoFullName}</p>
                <p className="text-base-content/60 text-sm">
                  {repo.attendance.replaceAll("_", " ")} · synced{" "}
                  {format(new Date(repo.lastGithubSyncAt), "PP")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
