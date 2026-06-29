import { Badge } from "@/components/ui/badge";
import {
  deleteBackstageGithubRepo,
  removeBackstageProject,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage/backstage-collection-mutations";
import type { BackstageProject } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RepoDeleteButton } from "../shared/RepoDeleteButton";
import { RepoRemoveButton } from "../shared/RepoRemoveButton";
import { RepoVisibilityButton } from "../shared/RepoVisibilityButton";

type BackstageProjectRowProps = {
  project: BackstageProject;
  isPrivate: boolean | null;
  disabled?: boolean;
};

function attendanceLabel(attendance: string) {
  return attendance.replaceAll("_", " ");
}

export function BackstageProjectRow({ project, isPrivate, disabled }: BackstageProjectRowProps) {
  const [pendingAction, setPendingAction] = useState<"visibility" | "remove" | "delete" | null>(
    null,
  );

  const actionsDisabled = disabled || pendingAction != null;

  const handleVisibility = async (visibility: "public" | "private") => {
    setPendingAction("visibility");
    try {
      await setBackstageRepoVisibility(project.repoFullName, visibility);
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: project.repoFullName,
      });
    } catch (err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemove = async () => {
    setPendingAction("remove");
    try {
      await removeBackstageProject(project.githubRepoId);
      toast.success("Removed from projects", { description: project.repoFullName });
    } catch (err: unknown) {
      toast.error("Remove failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    setPendingAction("delete");
    try {
      await deleteBackstageGithubRepo(project.repoFullName);
      toast.success("Repository deleted", { description: project.repoFullName });
    } catch (err: unknown) {
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

  return (
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
          <a
            href={`https://github.com/${project.repoFullName}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            {project.repoFullName}
          </a>
          <Badge variant="secondary">{attendanceLabel(project.attendance)}</Badge>
          {project.hasCustomSocialPreview ? <Badge variant="outline">custom preview</Badge> : null}
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

      <div className="flex flex-wrap items-center gap-2">
        {isPrivate != null ? (
          <RepoVisibilityButton
            repoFullName={project.repoFullName}
            isPrivate={isPrivate}
            disabled={actionsDisabled}
            isPending={pendingAction === "visibility"}
            onConfirm={handleVisibility}
          />
        ) : null}

        <RepoRemoveButton
          repoFullName={project.repoFullName}
          disabled={actionsDisabled}
          isPending={pendingAction === "remove"}
          onConfirm={handleRemove}
        />

        <RepoDeleteButton
          repoFullName={project.repoFullName}
          disabled={actionsDisabled}
          isPending={pendingAction === "delete"}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
