import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  deleteBackstageGithubRepo,
  removeBackstageProject,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import type { ImportJobOptions } from "@/routes/_backstage/backstage/-hooks/use-import-queue";
import { isGithubRepoDeletePermissionError } from "@/routes/_backstage/backstage/-utils/github-repo-delete-errors";
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { Download, Eye, EyeOff, Loader, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPatDialog } from "./AdminPatDialog";

type ProjectActionsDialogProps = {
  github: BackstageGithubRepo;
  project: BackstageProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestImport: (options: ImportJobOptions) => void;
  isImporting?: boolean;
  importDisabled?: boolean;
};

export function ProjectActionsDialog({
  github,
  project,
  open,
  onOpenChange,
  onRequestImport,
  isImporting,
  importDisabled,
}: ProjectActionsDialogProps) {
  const isImported = project != null;
  const repoFullName = isImported ? project.repoFullName : github.nameWithOwner;

  const [runEnrichment, setRunEnrichment] = useState(true);
  const [runEmbedding, setRunEmbedding] = useState(true);
  const [skipEmbeddingIfComplete, setSkipEmbeddingIfComplete] = useState(true);
  const [forceEmbedding, setForceEmbedding] = useState(false);
  const [adminPatOpen, setAdminPatOpen] = useState(false);
  const [confirmDeleteRepo, setConfirmDeleteRepo] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmDeleteRepo(false);
      setConfirmDeleteProject(false);
      setAdminPatOpen(false);
    }
  }, [open]);

  const visibilityMutation = useMutation({
    mutationFn: (visibility: "public" | "private") =>
      setBackstageRepoVisibility(repoFullName, visibility),
    onSuccess(_data, visibility) {
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: repoFullName,
      });
      onOpenChange(false);
    },
    onError(err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => removeBackstageProject(project!.githubRepoId),
    onSuccess() {
      toast.success("Project deleted", {
        description: `${repoFullName} removed from the site. GitHub repo unchanged.`,
      });
      onOpenChange(false);
    },
    onError(err: unknown) {
      toast.error("Delete project failed", { description: unwrapUnknownError(err).message });
    },
  });

  const deleteRepoMutation = useMutation({
    mutationFn: (overridePat?: string) =>
      deleteBackstageGithubRepo(repoFullName, overridePat ? { overridePat } : undefined),
    onSuccess() {
      toast.success("Repository deleted", { description: repoFullName });
      setAdminPatOpen(false);
      onOpenChange(false);
    },
    onError(err: unknown) {
      if (isGithubRepoDeletePermissionError(err)) {
        setConfirmDeleteRepo(false);
        setAdminPatOpen(true);
        return;
      }
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    },
  });

  const isBusy =
    isImporting ||
    importDisabled ||
    visibilityMutation.isPending ||
    deleteProjectMutation.isPending ||
    deleteRepoMutation.isPending;

  const nextVisibility = github.isPrivate ? "public" : "private";

  const handleImport = () => {
    onRequestImport({
      repoFullName: github.nameWithOwner,
      runEnrichment,
      runEmbedding,
      skipEmbeddingIfComplete,
      forceEmbedding,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-test="project-actions-dialog">
          <DialogHeader>
            <DialogTitle>{repoFullName}</DialogTitle>
            <DialogDescription>
              {isImported
                ? "Manage this imported project or remove it from the site."
                : "Import this repo to start tracking it, or delete it from GitHub."}
            </DialogDescription>
          </DialogHeader>

          {!isImported ? (
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Import</h3>
                <p className="text-base-content/60 mt-1 text-sm">
                  Add to projects and optionally run enrichment or embeddings.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="import-run-enrichment"
                    data-test="import-run-enrichment"
                    checked={runEnrichment}
                    onCheckedChange={(checked) => setRunEnrichment(checked === true)}
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="import-run-enrichment">Run metadata enrichment</Label>
                    <p className="text-base-content/60 text-sm">
                      Starts the enrichment workflow to infer missing description and tags.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="import-run-embedding"
                    data-test="import-run-embedding"
                    checked={runEmbedding}
                    onCheckedChange={(checked) => setRunEmbedding(checked === true)}
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="import-run-embedding">Run Gemma embeddings</Label>
                    <p className="text-base-content/60 text-sm">
                      Introspects README and nested package.json files, then indexes vectors for
                      search.
                    </p>
                  </div>
                </div>

                <div className="border-base-content/10 ml-7 flex flex-col gap-3 border-l pl-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="import-skip-embedding-if-complete"
                      data-test="import-skip-embedding-if-complete"
                      checked={skipEmbeddingIfComplete}
                      disabled={!runEmbedding || forceEmbedding}
                      onCheckedChange={(checked) => setSkipEmbeddingIfComplete(checked === true)}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="import-skip-embedding-if-complete">
                        Skip if already complete
                      </Label>
                      <p className="text-base-content/60 text-sm">
                        Skip embedding when description and tags exist on GitHub or in the README.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="import-force-embedding"
                      data-test="import-force-embedding"
                      checked={forceEmbedding}
                      disabled={!runEmbedding}
                      onCheckedChange={(checked) => {
                        const next = checked === true;
                        setForceEmbedding(next);
                        if (next) {
                          setSkipEmbeddingIfComplete(false);
                        }
                      }}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="import-force-embedding">Re-embed anyway</Label>
                      <p className="text-base-content/60 text-sm">
                        Force a fresh embedding run even when tags and description are present.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                data-test="import-project-confirm"
                disabled={isBusy}
                onClick={handleImport}
                className="gap-1.5 self-start"
              >
                {isImporting ? (
                  <>
                    <Loader className="size-3.5 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    Import project
                  </>
                )}
              </Button>
            </section>
          ) : (
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-medium">Project</h3>
                <p className="text-base-content/60 mt-1 text-sm">
                  Visibility and site tracking for this repo.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => visibilityMutation.mutate(nextVisibility)}
                  className="gap-1.5"
                  data-test="repo-visibility-toggle"
                >
                  {github.isPrivate ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                  Make {nextVisibility}
                </Button>
              </div>
            </section>
          )}

          <Separator />

          <section className="flex flex-col gap-4">
            {isImported ? (
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-destructive text-sm font-medium">Delete project</h3>
                  <p className="text-base-content/60 mt-1 text-sm">
                    Removes this project from the site database only. The GitHub repository is not
                    changed.
                  </p>
                </div>

                {confirmDeleteProject ? (
                  <div className="border-destructive/20 bg-destructive/5 flex flex-wrap items-center gap-2 rounded-lg border p-3">
                    <p className="text-sm">
                      Delete project record for <span className="font-medium">{repoFullName}</span>{" "}
                      from the site?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDeleteProject(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteProjectMutation.isPending}
                      onClick={() => deleteProjectMutation.mutate()}
                      data-test="delete-project-confirm"
                    >
                      {deleteProjectMutation.isPending ? "Deleting…" : "Confirm delete project"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => setConfirmDeleteProject(true)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 self-start"
                    data-test="delete-project"
                  >
                    <Trash2 className="size-3.5" />
                    Delete project (site only)
                  </Button>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-destructive text-sm font-medium">Delete repository</h3>
                <p className="text-base-content/60 mt-1 text-sm">
                  Permanently deletes the repo on GitHub
                  {isImported ? " and removes its project record" : ""}. This cannot be undone.
                </p>
              </div>

              {confirmDeleteRepo ? (
                <div className="border-destructive/20 bg-destructive/5 flex flex-wrap items-center gap-2 rounded-lg border p-3">
                  <p className="text-sm">
                    Permanently delete <span className="font-medium">{repoFullName}</span> on
                    GitHub?
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDeleteRepo(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteRepoMutation.isPending}
                    onClick={() => deleteRepoMutation.mutate(undefined)}
                    data-test="delete-repo-confirm"
                  >
                    {deleteRepoMutation.isPending ? "Deleting…" : "Confirm delete repository"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => setConfirmDeleteRepo(true)}
                  className="gap-1.5 self-start"
                  data-test="delete-repo"
                >
                  <Trash2 className="size-3.5" />
                  Delete repository on GitHub
                </Button>
              )}
            </div>
          </section>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminPatDialog
        open={adminPatOpen}
        onOpenChange={setAdminPatOpen}
        repoFullName={repoFullName}
        isRetrying={deleteRepoMutation.isPending}
        onRetry={(pat) => deleteRepoMutation.mutate(pat)}
      />
    </>
  );
}
