import { backstageGithubReposWithTrackingLiveQuery } from "@/data-access-layer/backstage/collections/live-queries";
import { importBackstageProject } from "@/data-access-layer/backstage/collections/mutations";
import { backstageGithubReposQueryOptions } from "@/data-access-layer/backstage/projects-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { unwrapUnknownError } from "@/utils/errors";
import { useQuery } from "@tanstack/react-query";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BackstageRepoRow } from "./BackstageRepoRow";

export function BackstageReposContent() {
  const { data: repoRows } = useLiveSuspenseQuery(backstageGithubReposWithTrackingLiveQuery);
  const { data: githubErrors = [] } = useQuery({
    ...backstageGithubReposQueryOptions,
    select: (data) => data.errors,
  });
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

  const trackedCount = repoRows.filter((row) => row.isTracked).length;

  const handleImport = async (repoFullName: string) => {
    setImportingRepo(repoFullName);
    try {
      const tx = importBackstageProject({ repoFullName, runEnrichment: runEnrichmentOnImport });
      await tx.isPersisted.promise;
      toast.success(
        runEnrichmentOnImport ? "Imported and enrichment started" : "Imported to projects",
        { description: repoFullName },
      );
    } catch (err: unknown) {
      toast.error("Import failed", { description: unwrapUnknownError(err).message });
    } finally {
      setImportingRepo(null);
    }
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
              {repoRows.length} repos · {trackedCount} already in projects
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
          {repoRows.length === 0 ? (
            <p className="text-base-content/50 px-4 py-6 text-sm">
              {githubErrors.length > 0
                ? "No accessible repos returned. Org-restricted repos are skipped when your PAT exceeds the org token lifetime policy."
                : "No repos found."}
            </p>
          ) : (
            repoRows.map((row) => (
              <BackstageRepoRow
                key={row.repo.id}
                repo={row.repo}
                isTracked={row.isTracked}
                isImporting={importingRepo === row.repo.nameWithOwner}
                onImport={() => handleImport(row.repo.nameWithOwner)}
                disabled={importingRepo != null}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
