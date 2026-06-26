import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
} from "@/data-access-layer/backstage/projects-query-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { importProjectRepo } from "@/lib/backstage/projects.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_backstage/backstage/repos")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(backstageGithubReposQueryOptions),
      context.queryClient.ensureQueryData(backstageProjectsQueryOptions),
    ]),
  component: BackstageReposPage,
});

function BackstageReposPage() {
  const { data: githubRepos } = useSuspenseQuery(backstageGithubReposQueryOptions);
  const { data: projects } = useSuspenseQuery(backstageProjectsQueryOptions);
  const [runEnrichmentOnImport, setRunEnrichmentOnImport] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);

  const trackedNames = new Set(projects.map((project) => project.repoFullName));

  const importMutation = useMutation({
    mutationFn: (repoFullName: string) =>
      importProjectRepo({ data: { repoFullName, runEnrichment: runEnrichmentOnImport } }),
    onSuccess(result, repoFullName) {
      if (result.runId) {
        toast.success("Imported and enrichment started", {
          description: `${repoFullName} · run ${result.runId.slice(0, 8)}`,
        });
      } else {
        toast.success("Imported to projects", { description: repoFullName });
      }
    },
    onError(err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    },
    onSettled() {
      setImportingRepo(null);
    },
    meta: {
      invalidates: [
        ["backstage", "projects"],
        ["backstage", "project-enrichment"],
      ],
    },
  });

  const handleImport = (repoFullName: string) => {
    setImportingRepo(repoFullName);
    importMutation.mutate(repoFullName);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-repos">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repos</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Your 100 most recently pushed public repos on GitHub. Quick-import into projects.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>GitHub repos</CardTitle>
            <CardDescription>
              {githubRepos.length} repos · {trackedNames.size} already in projects
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="run-enrichment-on-import"
              data-test="run-enrichment-on-import"
              checked={runEnrichmentOnImport}
              onCheckedChange={(checked) => setRunEnrichmentOnImport(checked === true)}
            />
            <Label htmlFor="run-enrichment-on-import" className="text-sm font-normal">
              Run enrichment on import
            </Label>
          </div>
        </CardHeader>
        <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
          {githubRepos.length === 0 ? (
            <p className="text-base-content/50 px-4 py-6 text-sm">No public repos found.</p>
          ) : (
            githubRepos.map((repo) => {
              const isTracked = trackedNames.has(repo.nameWithOwner);
              const isImporting = importingRepo === repo.nameWithOwner && importMutation.isPending;

              return (
                <div
                  key={repo.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                  data-test="github-repo-row"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{repo.nameWithOwner}</p>
                      {isTracked ? (
                        <span className="bg-base-200 text-base-content/70 rounded px-2 py-0.5 text-xs">
                          In projects
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base-content/60 mt-1 text-sm">
                      {repo.description || "(no description)"}
                    </p>
                    {repo.topics.length > 0 ? (
                      <p className="text-base-content/45 mt-1 text-xs">{repo.topics.join(" · ")}</p>
                    ) : null}
                  </div>
                  <Button
                    data-test="import-repo"
                    variant={isTracked ? "outline" : "default"}
                    size="sm"
                    disabled={importMutation.isPending}
                    onClick={() => handleImport(repo.nameWithOwner)}
                  >
                    {isImporting ? "Importing…" : isTracked ? "Re-import" : "Import"}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
