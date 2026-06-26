import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
  backstageRepoMutationInvalidates,
} from "@/data-access-layer/backstage/projects-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { importProjectRepo } from "@/lib/backstage/projects.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BackstageRepoRow } from "./-components/BackstageRepoRow";

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
  const { data: githubData } = useSuspenseQuery(backstageGithubReposQueryOptions);
  const { data: projects } = useSuspenseQuery(backstageProjectsQueryOptions);
  const githubRepos = githubData.repos;
  const githubErrors = githubData.errors;
  const [runEnrichmentOnImport, setRunEnrichmentOnImport] = useState(false);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const githubErrorsWarned = useRef(false);

  useEffect(() => {
    if (githubErrorsWarned.current || githubErrors.length === 0) {
      return;
    }
    githubErrorsWarned.current = true;
    const description =
      githubErrors.length > 1
        ? `${githubErrors[0]} (+${githubErrors.length - 1} more)`
        : githubErrors[0];
    toast.warning("Some repos could not be loaded from GitHub", { description });
  }, [githubErrors]);

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
      invalidates: backstageRepoMutationInvalidates,
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
          Your 100 most recently pushed repos on GitHub. Import, change visibility, or delete.
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
            <p className="text-base-content/50 px-4 py-6 text-sm">
              {githubErrors.length > 0
                ? "No accessible repos returned. Org-restricted repos are skipped when your PAT exceeds the org token lifetime policy."
                : "No repos found."}
            </p>
          ) : (
            githubRepos.map((repo) => (
              <BackstageRepoRow
                key={repo.id}
                repo={repo}
                isTracked={trackedNames.has(repo.nameWithOwner)}
                isImporting={importingRepo === repo.nameWithOwner && importMutation.isPending}
                onImport={() => handleImport(repo.nameWithOwner)}
                disabled={importMutation.isPending}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
