import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteBackstageGithubRepo,
  removeBackstageProject,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import type { BackstageGithubRepo, BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Download, ExternalLink, GitFork, Github, Loader, Star } from "lucide-react";
import { toast } from "sonner";
import { RepoDeleteButton } from "../shared/RepoDeleteButton";
import { RepoRemoveButton } from "../shared/RepoRemoveButton";
import { RepoVisibilityButton } from "../shared/RepoVisibilityButton";
import { attendanceLabel } from "./helpers";

type BackstageProjectRowProps = {
  github: BackstageGithubRepo;
  project: BackstageProject | null;
  disabled?: boolean;
  onRequestImport?: () => void;
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
  const isImported = project != null;

  const visibilityMutation = useMutation({
    mutationFn: (input: { visibility: "public" | "private"; repoFullName: string }) =>
      setBackstageRepoVisibility(input.repoFullName, input.visibility),
    onSuccess(_data, { visibility, repoFullName }) {
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: repoFullName,
      });
    },
    onError(err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (input: { githubRepoId: string; repoFullName: string }) =>
      removeBackstageProject(input.githubRepoId),
    onSuccess(_data, { repoFullName }) {
      toast.success("Removed from projects", { description: repoFullName });
    },
    onError(err: unknown) {
      toast.error("Remove failed", { description: unwrapUnknownError(err).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (repoFullName: string) => deleteBackstageGithubRepo(repoFullName),
    onSuccess(_data, repoFullName) {
      toast.success("Repository deleted", { description: repoFullName });
    },
    onError(err: unknown) {
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    },
  });

  const actionsDisabled =
    disabled ||
    importDisabled ||
    visibilityMutation.isPending ||
    removeMutation.isPending ||
    deleteMutation.isPending;

  const imageUrl = isImported ? project.currentOgImageUrl : github.openGraphImageUrl;
  const repoName = isImported ? project.repoFullName : github.nameWithOwner;
  const repoUrl = isImported ? `https://github.com/${project.repoFullName}` : github.url;
  const description = isImported
    ? project.currentDescription || "(no description)"
    : github.description || "(no description)";
  const homepageUrl = isImported ? project.currentHomepage : github.homepageUrl;

  return (
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

      <div className="flex flex-wrap items-center gap-2">
        {isImported ? (
          <>
            <RepoVisibilityButton
              repoFullName={project.repoFullName}
              isPrivate={github.isPrivate}
              disabled={actionsDisabled}
              isPending={visibilityMutation.isPending}
              onConfirm={(visibility) =>
                visibilityMutation.mutate({ visibility, repoFullName: project.repoFullName })
              }
            />
            <RepoRemoveButton
              repoFullName={project.repoFullName}
              disabled={actionsDisabled}
              isPending={removeMutation.isPending}
              onConfirm={() =>
                removeMutation.mutate({
                  githubRepoId: project.githubRepoId,
                  repoFullName: project.repoFullName,
                })
              }
            />
            <RepoDeleteButton
              repoFullName={project.repoFullName}
              disabled={actionsDisabled}
              isPending={deleteMutation.isPending}
              onConfirm={() => deleteMutation.mutate(project.repoFullName)}
            />
          </>
        ) : (
          <Button
            data-test="import-github-project"
            size="sm"
            disabled={importDisabled || isImporting}
            onClick={onRequestImport}
            className="gap-1.5"
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
        )}
      </div>
    </div>
  );
}
