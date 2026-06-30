import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  deleteBackstageGithubRepo,
  removeBackstageProject,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import { isServerEmbeddingAvailableInClient } from "@/lib/envs/server-embedding";
import {
  defaultSingleImportWorkflowOptions,
  type ImportProjectOptions,
  type ImportWorkflowOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { isGithubRepoDeletePermissionError } from "@/routes/_backstage/backstage/-utils/github-repo-delete-errors";
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { projectNeedsEnrichmentReview } from "@/routes/_backstage/backstage/-components/projects/helpers";
import { Download, Eye, EyeOff, Loader, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPatDialog } from "./AdminPatDialog";
import { ImportWorkflowOptionsFields } from "./ImportWorkflowOptionsFields";

type ProjectActionsDialogProps = {
  github: BackstageGithubRepo;
  project: BackstageProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestImport: (options: ImportProjectOptions) => void;
  onRequestReview?: () => void;
  isImporting?: boolean;
  importDisabled?: boolean;
};

export function ProjectActionsDialog({
  github,
  project,
  open,
  onOpenChange,
  onRequestImport,
  onRequestReview,
  isImporting,
  importDisabled,
}: ProjectActionsDialogProps) {
  const isImported = project != null;
  const needsReview = isImported && projectNeedsEnrichmentReview(project);
  const repoFullName = isImported ? project.repoFullName : github.nameWithOwner;

  const serverEmbeddingAvailable = isServerEmbeddingAvailableInClient();

  const [importOptions, setImportOptions] = useState<ImportWorkflowOptions>(() =>
    defaultSingleImportWorkflowOptions(serverEmbeddingAvailable),
  );
  const [adminPatOpen, setAdminPatOpen] = useState(false);
  const [confirmDeleteRepo, setConfirmDeleteRepo] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmDeleteRepo(false);
      setConfirmDeleteProject(false);
      setAdminPatOpen(false);
      setImportOptions(defaultSingleImportWorkflowOptions(serverEmbeddingAvailable));
    }
  }, [open, serverEmbeddingAvailable]);

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
      ...importOptions,
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

              <ImportWorkflowOptionsFields
                idPrefix="import"
                options={importOptions}
                onChange={setImportOptions}
              />

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
              {needsReview ? (
                <div className="border-amber-400/30 bg-amber-500/5 flex flex-col gap-3 rounded-lg border p-3">
                  <div>
                    <h3 className="text-sm font-medium">Enrichment review</h3>
                    <p className="text-base-content/60 mt-1 text-sm">
                      AI suggestions are ready but not applied to GitHub yet.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 self-start"
                    data-test="project-actions-review-enrichment"
                    disabled={isBusy}
                    onClick={() => onRequestReview?.()}
                  >
                    <Pencil className="size-3.5" />
                    Review & apply
                  </Button>
                </div>
              ) : null}

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
