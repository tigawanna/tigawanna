import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BackstageProject } from "@/types/backstage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EllipsisVertical, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { EnrichmentReviewDialogLoader } from "./EnrichmentReviewDialogLoader";
import {
  attendanceLabel,
  backstageProjectDetailRoute,
  pendingReviewBadgeClass,
  projectNeedsEnrichmentReview,
} from "./helpers";
import { ProjectActionsDialog } from "./ProjectActionsDialog";

type BackstageProjectRowProps = {
  project: BackstageProject;
  disabled?: boolean;
};

export function BackstageProjectRow({ project, disabled }: BackstageProjectRowProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const needsReview = projectNeedsEnrichmentReview(project);
  const detailRoute = backstageProjectDetailRoute(project.repoFullName);

  return (
    <>
      <ProjectActionsDialog
        project={project}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        onRequestReview={() => {
          setActionsOpen(false);
          setReviewOpen(true);
        }}
      />

      {needsReview ? (
        <EnrichmentReviewDialogLoader
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          repoFullName={project.repoFullName}
          project={project}
        />
      ) : null}

      <div className="flex flex-wrap items-start gap-4 px-4 py-4" data-test="project-row">
        {project.currentOgImageUrl ? (
          <img
            src={project.currentOgImageUrl}
            alt=""
            className="border-base-content/10 size-16 shrink-0 rounded-lg border object-cover"
          />
        ) : (
          <div className="bg-base-200 border-base-content/10 size-16 shrink-0 rounded-lg border" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {detailRoute ? (
              <Link
                {...detailRoute}
                className="font-medium hover:underline"
                data-test="project-detail-link"
              >
                {project.repoFullName}
              </Link>
            ) : (
              <a
                href={`https://github.com/${project.repoFullName}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline"
              >
                {project.repoFullName}
              </a>
            )}
            {needsReview ? (
              <button
                type="button"
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                  pendingReviewBadgeClass,
                )}
                data-test="project-needs-review-badge"
                onClick={() => setReviewOpen(true)}
              >
                Needs approval
              </button>
            ) : (
              <Badge variant="secondary" data-test="project-status-badge">
                {attendanceLabel(project.attendance)}
              </Badge>
            )}
            {project.enrichedByAi && !needsReview ? (
              <Badge
                variant="outline"
                className="border-violet-400/60 bg-violet-950 text-violet-50"
                data-test="project-ai-enriched-badge"
              >
                AI enriched
              </Badge>
            ) : null}
            {project.hasCustomSocialPreview ? (
              <Badge variant="outline">custom preview</Badge>
            ) : null}
          </div>

          <p className="text-base-content/60 mt-1 text-sm">
            {project.currentDescription || "(no description)"}
          </p>

          {project.currentTopics.length > 0 ? (
            <p className="text-base-content/45 mt-1 text-xs">{project.currentTopics.join(" · ")}</p>
          ) : null}

          <div className="text-base-content/40 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span>Synced {format(new Date(project.lastGithubSyncAt), "PP")}</span>
            <span>Added {format(new Date(project.createdAt), "PP")}</span>
            {project.lastAppliedAt ? (
              <span>Applied {format(new Date(project.lastAppliedAt), "PP")}</span>
            ) : null}
            {project.currentHomepage ? (
              <a
                href={project.currentHomepage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                Homepage
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          data-test="project-row-actions"
          disabled={disabled}
          onClick={() => setActionsOpen(true)}
          aria-label={`Actions for ${project.repoFullName}`}
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </div>
    </>
  );
}
