import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  approveProjectEnrichmentSuggestion,
  rejectProjectEnrichmentSuggestion,
} from "@/modules/backstage/projects-enrichment.functions";
import type {
  BackstageProject,
  BackstageProjectEnrichment,
} from "@/modules/backstage/projects.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type EnrichmentReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoFullName: string;
  project: BackstageProject;
  enrichment: BackstageProjectEnrichment;
};

/**
 * Modal for reviewing and applying AI enrichment suggestions to GitHub.
 */
export function EnrichmentReviewDialog({
  open,
  onOpenChange,
  repoFullName,
  project,
  enrichment,
}: EnrichmentReviewDialogProps) {
  const [summary, setSummary] = useState(enrichment.briefSummary ?? "");
  const [description, setDescription] = useState(enrichment.suggestedDescription ?? "");
  const [homepage, setHomepage] = useState(enrichment.suggestedHomepage ?? "");
  const [topics, setTopics] = useState(enrichment.suggestedTopics.join(", "));

  useEffect(() => {
    if (!open) {
      return;
    }

    setSummary(enrichment.briefSummary ?? "");
    setDescription(enrichment.suggestedDescription ?? "");
    setHomepage(enrichment.suggestedHomepage ?? "");
    setTopics(enrichment.suggestedTopics.join(", "));
  }, [open, enrichment]);

  const approve = useMutation({
    mutationFn: approveProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Applied to GitHub", { description: repoFullName });
      onOpenChange(false);
    },
    onError(err: unknown) {
      toast.error("Approve failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [
        [queryKeyPrefixes.backstage, "github-repos"],
        [queryKeyPrefixes.backstage, "projects"],
        [queryKeyPrefixes.backstage, "project-enrichment"],
        [queryKeyPrefixes.backstage, "projects", "detail", repoFullName],
      ],
    },
  });

  const reject = useMutation({
    mutationFn: rejectProjectEnrichmentSuggestion,
    onSuccess() {
      toast.success("Suggestion rejected");
      onOpenChange(false);
    },
    onError(err: unknown) {
      toast.error("Reject failed", { description: unwrapUnknownError(err).message });
    },
    meta: {
      invalidates: [
        [queryKeyPrefixes.backstage, "github-repos"],
        [queryKeyPrefixes.backstage, "projects"],
        [queryKeyPrefixes.backstage, "project-enrichment"],
        [queryKeyPrefixes.backstage, "projects", "detail", repoFullName],
      ],
    },
  });

  const isPending = approve.isPending || reject.isPending;
  const suggestionId = enrichment.suggestionId;

  function handleApprove() {
    if (!suggestionId) {
      return;
    }

    approve.mutate({
      data: {
        suggestionId,
        description,
        homepage,
        enrichedSummary: summary,
        topics: topics
          .split(",")
          .map((topic) => topic.trim())
          .filter((topic) => topic.length > 0),
      },
    });
  }

  function handleReject() {
    if (!suggestionId) {
      return;
    }

    reject.mutate({ data: { suggestionId } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        data-test="enrichment-review-dialog"
      >
        <DialogHeader>
          <DialogTitle>Review enrichment</DialogTitle>
          <DialogDescription>
            AI generated metadata for {repoFullName}. Edit fields below, then approve to push
            description, homepage, and tags to GitHub. The enriched summary is stored locally for
            reference.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase">Current on GitHub</p>
            <div className="space-y-2 text-sm">
              <p>{project.currentDescription || "(no description)"}</p>
              <p className="text-base-content/60">{project.currentHomepage || "(no homepage)"}</p>
              <p className="text-base-content/60">
                Tags: {project.currentTopics.join(", ") || "(none)"}
              </p>
            </div>
            {project.currentOgImageUrl ? (
              <img
                src={project.currentOgImageUrl}
                alt=""
                className="max-h-32 rounded-lg border border-base-content/10 object-cover"
              />
            ) : null}
          </section>

          <section className="space-y-4">
            <p className="text-base-content/60 text-xs font-medium uppercase">Suggested</p>

            <div className="space-y-2">
              <Label htmlFor="enrichment-review-summary">Enriched summary</Label>
              <Textarea
                id="enrichment-review-summary"
                data-test="enrichment-review-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrichment-review-description">Description</Label>
              <Textarea
                id="enrichment-review-description"
                data-test="enrichment-review-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrichment-review-homepage">Homepage</Label>
              <Input
                id="enrichment-review-homepage"
                data-test="enrichment-review-homepage"
                placeholder="https://..."
                value={homepage}
                onChange={(event) => setHomepage(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrichment-review-topics">Tags</Label>
              <Input
                id="enrichment-review-topics"
                data-test="enrichment-review-topics"
                placeholder="topic-one, topic-two"
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
              />
            </div>
          </section>
        </div>

        {enrichment.applyError ? (
          <p className="text-error text-sm" data-test="enrichment-review-apply-error">
            {enrichment.applyError}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            data-test="enrichment-review-reject"
            disabled={isPending || !suggestionId}
            onClick={handleReject}
          >
            {reject.isPending ? <Loader className="size-4 animate-spin" /> : null}
            Reject
          </Button>
          <Button
            data-test="enrichment-review-approve"
            disabled={isPending || !suggestionId || description.trim().length === 0}
            onClick={handleApprove}
          >
            {approve.isPending ? <Loader className="size-4 animate-spin" /> : null}
            Approve & apply to GitHub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
