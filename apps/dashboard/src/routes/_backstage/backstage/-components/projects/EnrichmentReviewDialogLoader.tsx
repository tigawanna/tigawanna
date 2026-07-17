import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { backstageProjectDetailQueryOptions } from "@/data-access-layer/backstage/projects/projects-query-options";
import type { BackstageProject } from "@/types/backstage";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { EnrichmentReviewDialog } from "./EnrichmentReviewDialog";

type EnrichmentReviewDialogLoaderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoFullName: string;
  project: BackstageProject;
};

/**
 * Fetches project enrichment detail on demand and opens the review dialog.
 */
export function EnrichmentReviewDialogLoader({
  open,
  onOpenChange,
  repoFullName,
  project,
}: EnrichmentReviewDialogLoaderProps) {
  const { data, isPending, isError } = useQuery({
    ...backstageProjectDetailQueryOptions(repoFullName),
    enabled: open,
  });

  const enrichment = data?.enrichment;
  const needsReview = enrichment?.status === "pending_review" && enrichment.suggestionId != null;

  if (!open) {
    return null;
  }

  if (needsReview && enrichment) {
    return (
      <EnrichmentReviewDialog
        open={open}
        onOpenChange={onOpenChange}
        repoFullName={repoFullName}
        project={project}
        enrichment={enrichment}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-test="enrichment-review-loader">
        <DialogHeader>
          <DialogTitle>Review enrichment</DialogTitle>
          <DialogDescription>{repoFullName}</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : null}

        {!isPending && (isError || !needsReview) ? (
          <p className="text-base-content/60 text-sm">No pending enrichment to review.</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
