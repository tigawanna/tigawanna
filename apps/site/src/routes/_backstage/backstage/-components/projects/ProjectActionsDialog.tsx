import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeBackstageProject } from "@/data-access-layer/backstage/backstage-collection-mutations";
import type { BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { projectNeedsEnrichmentReview } from "@/routes/_backstage/backstage/-components/projects/helpers";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProjectActionsDialogProps = {
  project: BackstageProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestReview?: () => void;
};

export function ProjectActionsDialog({
  project,
  open,
  onOpenChange,
  onRequestReview,
}: ProjectActionsDialogProps) {
  const needsReview = projectNeedsEnrichmentReview(project);
  const repoFullName = project.repoFullName;
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmDeleteProject(false);
    }
  }, [open]);

  const deleteProjectMutation = useMutation({
    mutationFn: () => removeBackstageProject(project.githubRepoId),
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

  const isBusy = deleteProjectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-test="project-actions-dialog">
        <DialogHeader>
          <DialogTitle>{repoFullName}</DialogTitle>
          <DialogDescription>
            Manage this imported project. GitHub visibility and repo deletion live on the GitHub
            tab.
          </DialogDescription>
        </DialogHeader>

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
            <h3 className="text-destructive text-sm font-medium">Delete project</h3>
            <p className="text-base-content/60 mt-1 text-sm">
              Removes this project from the site database only. The GitHub repository is not
              changed.
            </p>
          </div>

          {confirmDeleteProject ? (
            <div className="border-destructive/20 bg-destructive/5 flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <p className="text-sm">
                Delete project record for <span className="font-medium">{repoFullName}</span> from
                the site?
              </p>
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteProject(false)}>
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
        </section>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
