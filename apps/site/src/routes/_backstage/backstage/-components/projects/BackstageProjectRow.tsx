import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { cn } from "@/lib/utils";
import type { ImportProjectOptions } from "@/routes/_backstage/backstage/-utils/import-options";
import { format, formatDistanceToNow } from "date-fns";
import { EllipsisVertical, ExternalLink, GitFork, Github, Star } from "lucide-react";
import { useState } from "react";
import { attendanceLabel } from "./helpers";
import { ProjectActionsDialog } from "./ProjectActionsDialog";

type BackstageProjectRowProps = {
  github: BackstageGithubRepo;
  project: BackstageProject | null;
  disabled?: boolean;
  onRequestImport?: (options: ImportProjectOptions) => void;
  isImporting?: boolean;
  importDisabled?: boolean;
};

export function BackstageProjectRow({
  github,
  project,
  disabled,
  onRequestImport,
  isImporting,
  importDisabled,
}: BackstageProjectRowProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const isImported = project != null;

  const imageUrl = isImported ? project.currentOgImageUrl : github.openGraphImageUrl;
  const repoName = isImported ? project.repoFullName : github.nameWithOwner;
  const repoUrl = isImported ? `https://github.com/${project.repoFullName}` : github.url;
  const description = isImported
    ? project.currentDescription || "(no description)"
    : github.description || "(no description)";
  const homepageUrl = isImported ? project.currentHomepage : github.homepageUrl;

  return (
    <>
      <ProjectActionsDialog
        github={github}
        project={project}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        onRequestImport={(options) => onRequestImport?.(options)}
        isImporting={isImporting}
        importDisabled={importDisabled || disabled}
      />

      <div
        className={cn(
          "flex flex-wrap items-start gap-4 px-4 py-4",
          !isImported && "border-base-content/10 bg-base-100/50 border border-dashed",
        )}
        data-test={isImported ? "project-row" : "github-only-project-row"}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className={cn(
              "border-base-content/10 size-16 shrink-0 rounded-lg border object-cover",
              !isImported && "opacity-90",
            )}
          />
        ) : (
          <div className="bg-base-200 border-base-content/10 flex size-16 shrink-0 items-center justify-center rounded-lg border">
            {!isImported ? <Github className="text-base-content/40 size-6" /> : null}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline"
            >
              {repoName}
            </a>
            {isImported ? (
              <Badge variant="secondary" data-test="project-status-badge">
                Imported
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                data-test="project-status-badge"
              >
                <Github className="size-3" />
                Not imported
              </Badge>
            )}
            {isImported ? (
              <>
                <Badge variant="secondary">{attendanceLabel(project.attendance)}</Badge>
                {project.hasCustomSocialPreview ? (
                  <Badge variant="outline">custom preview</Badge>
                ) : null}
              </>
            ) : (
              <>{github.isArchived ? <Badge variant="outline">archived</Badge> : null}</>
            )}
          </div>

          <p className="text-base-content/60 mt-1 text-sm">{description}</p>

          {isImported && project.currentTopics.length > 0 ? (
            <p className="text-base-content/45 mt-1 text-xs">{project.currentTopics.join(" · ")}</p>
          ) : null}

          <div className="text-base-content/40 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {isImported ? (
              <>
                <span>Synced {format(new Date(project.lastGithubSyncAt), "PP")}</span>
                <span>Added {format(new Date(project.createdAt), "PP")}</span>
                {project.lastAppliedAt ? (
                  <span>Applied {format(new Date(project.lastAppliedAt), "PP")}</span>
                ) : null}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3" />
                  {github.stargazerCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="size-3" />
                  {github.forkCount}
                </span>
                <span>
                  Pushed {formatDistanceToNow(new Date(github.pushedAt), { addSuffix: true })}
                </span>
              </>
            )}
            {homepageUrl ? (
              <a
                href={homepageUrl}
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
          aria-label={`Actions for ${repoName}`}
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </div>
    </>
  );
}
