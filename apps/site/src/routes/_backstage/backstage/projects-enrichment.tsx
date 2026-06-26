import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  projectEnrichmentRunsQueryOptions,
  projectEnrichmentSuggestionsQueryOptions,
  projectReposQueryOptions,
} from "@/data-access-layer/backstage/projects-enrichment-query-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  approveProjectEnrichmentSuggestion,
  rejectProjectEnrichmentSuggestion,
} from "@/lib/backstage/projects-enrichment.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_backstage/backstage/projects-enrichment")({
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
  component: ProjectsEnrichmentPage,
});

function ProjectsEnrichmentPage() {
  const queryClient = useQueryClient();
  const { data: suggestions } = useSuspenseQuery(projectEnrichmentSuggestionsQueryOptions);
  const { data: repos } = useSuspenseQuery(projectReposQueryOptions);
  const { data: runs } = useSuspenseQuery(projectEnrichmentRunsQueryOptions);
  const [manualRepo, setManualRepo] = useState("");

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["backstage", "project-enrichment"],
    });
  };

  const triggerRun = useMutation({
    mutationFn: async (input: { limit?: number; repos?: string[]; force?: boolean }) => {
      const res = await fetch("/api/project-enrichment/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to start enrichment run: ${res.status} ${body}`);
      }

      return (await res.json()) as { runId: string; status: string };
    },
    onSuccess(result) {
      toast.success("Enrichment run started", { description: `Run ${result.runId}` });
      invalidate();
    },
    onError(err: unknown) {
      toast.error("Failed to start run", { description: unwrapUnknownError(err).message });
    },
  });

  const completeCount = repos.filter((repo) => repo.attendance === "complete").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="projects-enrichment">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Project enrichment</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Scan recent GitHub repos, queue AI suggestions, and approve metadata updates from here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
          <CardDescription>
            {repos.length} tracked repos · {completeCount} already complete on GitHub ·{" "}
            {suggestions.length} pending review
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              data-test="trigger-full-scan"
              disabled={triggerRun.isPending}
              onClick={() => triggerRun.mutate({ limit: 100 })}
            >
              Scan latest 100
            </Button>
            <div className="flex min-w-[280px] flex-1 gap-2">
              <Input
                data-test="manual-repo-input"
                placeholder="owner/repo"
                value={manualRepo}
                onChange={(event) => setManualRepo(event.target.value)}
              />
              <Button
                data-test="trigger-manual-repo"
                variant="outline"
                disabled={triggerRun.isPending || manualRepo.trim().length === 0}
                onClick={() => {
                  const repo = manualRepo.trim();
                  if (!repo.includes("/")) {
                    toast.error("Use owner/repo format");
                    return;
                  }
                  triggerRun.mutate({ repos: [repo], force: true });
                  setManualRepo("");
                }}
              >
                Re-analyze
              </Button>
            </div>
          </div>

          {runs.length > 0 ? (
            <div className="text-base-content/60 space-y-2 text-sm">
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
            <p className="text-base-content/50 text-sm">No runs yet.</p>
          )}
        </CardContent>
      </Card>

      {suggestions.length === 0 ? (
        <p className="text-base-content/50 text-sm">No suggestions waiting for review.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {suggestions.map((suggestion) => (
            <SuggestionReviewCard key={suggestion.id} suggestion={suggestion} onDone={invalidate} />
          ))}
        </div>
      )}
    </div>
  );
}

type Suggestion = Awaited<
  ReturnType<
    typeof import("@/lib/backstage/projects-enrichment.functions").listProjectEnrichmentSuggestions
  >
>[number];

function SuggestionReviewCard({
  suggestion,
  onDone,
}: {
  suggestion: Suggestion;
  onDone: () => void;
}) {
  const [description, setDescription] = useState(suggestion.suggestedDescription ?? "");
  const [homepage, setHomepage] = useState(suggestion.suggestedHomepage ?? "");
  const [topics, setTopics] = useState(suggestion.suggestedTopics.join(", "));

  const approve = useMutation({
    mutationFn: approveProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Applied to GitHub");
      onDone();
    },
    onError(err: unknown) {
      toast.error("Approve failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [["backstage", "project-enrichment"]],
    },
  });

  const reject = useMutation({
    mutationFn: rejectProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Suggestion rejected");
      onDone();
    },
    onError(err: unknown) {
      toast.error("Reject failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [["backstage", "project-enrichment"]],
    },
  });

  return (
    <Card data-test="enrichment-suggestion-card">
      <CardHeader>
        <CardTitle>{suggestion.repoFullName}</CardTitle>
        <CardDescription>
          Current topics: {suggestion.currentTopics.join(", ") || "(none)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-base-content/60 text-xs font-medium uppercase">Current</p>
          <p className="text-sm">{suggestion.currentDescription || "(no description)"}</p>
          <p className="text-base-content/60 text-sm">
            {suggestion.currentHomepage || "(no homepage)"}
          </p>
          {suggestion.currentOgImageUrl ? (
            <img
              src={suggestion.currentOgImageUrl}
              alt=""
              className="max-h-32 rounded-lg border border-base-content/10 object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-base-content/60 text-xs font-medium uppercase">Suggested</p>
          <Textarea
            data-test="suggestion-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
          <Input
            data-test="suggestion-homepage"
            placeholder="https://..."
            value={homepage}
            onChange={(event) => setHomepage(event.target.value)}
          />
          <Input
            data-test="suggestion-topics"
            placeholder="topic-one, topic-two"
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              data-test="approve-suggestion"
              disabled={approve.isPending || reject.isPending || description.trim().length === 0}
              onClick={() =>
                approve.mutate({
                  data: {
                    suggestionId: suggestion.id,
                    description,
                    homepage,
                    topics: topics
                      .split(",")
                      .map((topic) => topic.trim())
                      .filter((topic) => topic.length > 0),
                  },
                })
              }
            >
              Approve & apply
            </Button>
            <Button
              data-test="reject-suggestion"
              variant="outline"
              disabled={approve.isPending || reject.isPending}
              onClick={() => reject.mutate({ data: { suggestionId: suggestion.id } })}
            >
              Reject
            </Button>
          </div>
          {suggestion.applyError ? (
            <p className="text-error text-sm">{suggestion.applyError}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
