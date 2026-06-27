import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  projectEnrichmentRunsQueryOptions,
  projectEnrichmentSuggestionsQueryOptions,
  projectReposQueryOptions,
} from "@/data-access-layer/backstage/projects-enrichment-query-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { triggerProjectEnrichmentRun } from "@/modules/backstage/projects-enrichment.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { SuggestionReviewCard } from "./-components/SuggestionReviewCard";

const SCAN_PRESETS = [
  { label: "Latest 5", limit: 5 },
  { label: "Latest 25", limit: 25 },
  { label: "All (100)", limit: 100 },
] as const;

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
  const { data: runs } = useSuspenseQuery(projectEnrichmentRunsQueryOptions);
  const [manualRepo, setManualRepo] = useState("");
  const [pendingRepo, setPendingRepo] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["backstage", "project-enrichment"],
    });
  };

  const triggerRun = useMutation({
    mutationFn: (input: { limit?: number; repos?: string[]; force?: boolean }) =>
      triggerProjectEnrichmentRun({ data: input }),
    onSuccess(result) {
      toast.success("Enrichment run started", { description: `Run ${result.runId}` });
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Failed to start run", { description: unwrapUnknownError(err).message });
    },
    onSettled() {
      setPendingRepo(null);
    },
  });

  const runForRepo = (repoFullName: string) => {
    setPendingRepo(repoFullName);
    triggerRun.mutate({ repos: [repoFullName], force: true });
  };

  const runManualRepo = () => {
    const repo = manualRepo.trim();
    if (!repo.includes("/")) {
      toast.error("Use owner/repo format");
      return;
    }
    setManualRepo("");
    runForRepo(repo);
  };

  const runTrackedRepos = (count: number | "all") => {
    const names =
      count === "all"
        ? repos.map((repo) => repo.repoFullName)
        : repos.slice(0, count).map((repo) => repo.repoFullName);

    if (names.length === 0) {
      toast.error("No tracked repos yet");
      return;
    }

    triggerRun.mutate({ repos: names, force: true });
  };

  const completeCount = repos.filter((repo) => repo.attendance === "complete").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-workflow">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflow</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          GitHub enrichment runs, metadata review, and re-sync controls.
        </p>
      </div>

      <Card data-test="enrichment-command-center">
        <CardHeader>
          <CardTitle>Enrichment command center</CardTitle>
          <CardDescription>
            {repos.length} tracked repos · {completeCount} complete on GitHub · {suggestions.length}{" "}
            pending review
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Discover from GitHub
            </p>
            <div className="flex flex-wrap gap-2">
              {SCAN_PRESETS.map((preset) => (
                <Button
                  key={preset.limit}
                  data-test={`trigger-scan-${preset.limit}`}
                  variant="outline"
                  disabled={triggerRun.isPending}
                  onClick={() => triggerRun.mutate({ limit: preset.limit })}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Re-enrich tracked
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                data-test="trigger-tracked-first-5"
                variant="outline"
                disabled={triggerRun.isPending || repos.length === 0}
                onClick={() => runTrackedRepos(5)}
              >
                First 5 tracked
              </Button>
              <Button
                data-test="trigger-tracked-all"
                variant="outline"
                disabled={triggerRun.isPending || repos.length === 0}
                onClick={() => runTrackedRepos("all")}
              >
                All tracked ({repos.length})
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Single repo
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-[240px] flex-1"
                data-test="manual-repo-input"
                placeholder="owner/repo"
                value={manualRepo}
                onChange={(event) => setManualRepo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    runManualRepo();
                  }
                }}
              />
              <Button
                data-test="trigger-manual-repo"
                disabled={triggerRun.isPending || manualRepo.trim().length === 0}
                onClick={runManualRepo}
              >
                Run enrichment
              </Button>
            </div>
          </div>

          {runs.length > 0 ? (
            <div className="text-base-content/60 space-y-2 border-t border-base-content/10 pt-4 text-sm">
              <p className="text-base-content/80 text-xs font-medium uppercase tracking-wide">
                Recent runs
              </p>
              {runs.slice(0, 5).map((run) => (
                <div key={run.id} className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs">{run.id.slice(0, 8)}</span>
                  <span>{run.status}</span>
                  <span>
                    synced {run.reposSynced} · skipped {run.reposSkipped} · enriched{" "}
                    {run.reposEnriched}
                  </span>
                  <span>{format(new Date(run.startedAt), "PPp")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/50 border-t border-base-content/10 pt-4 text-sm">
              No runs yet.
            </p>
          )}
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
              <div
                key={repo.githubRepoId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                data-test="tracked-repo-row"
              >
                <div className="min-w-0">
                  <p className="font-medium">{repo.repoFullName}</p>
                  <p className="text-base-content/60 text-sm">
                    {repo.attendance.replaceAll("_", " ")} · synced{" "}
                    {format(new Date(repo.lastGithubSyncAt), "PP")}
                  </p>
                </div>
                <Button
                  data-test="trigger-tracked-repo"
                  variant="outline"
                  size="sm"
                  disabled={triggerRun.isPending}
                  onClick={() => runForRepo(repo.repoFullName)}
                >
                  {pendingRepo === repo.repoFullName && triggerRun.isPending
                    ? "Starting…"
                    : "Run enrichment"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
