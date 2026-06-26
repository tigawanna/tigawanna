import { backstageRepoMutationInvalidates } from "@/data-access-layer/backstage/projects-query-options";
import type { listProjectRepos } from "@/lib/backstage/projects-enrichment.functions";
import {
  deleteGithubRepoForBackstage,
  removeProjectRepo,
  setGithubRepoVisibilityForBackstage,
} from "@/lib/backstage/projects.functions";
import { Badge } from "@/components/ui/badge";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { RepoDeleteButton } from "./RepoDeleteButton";
import { RepoRemoveButton } from "./RepoRemoveButton";
import { RepoVisibilityButton } from "./RepoVisibilityButton";

type Project = Awaited<ReturnType<typeof listProjectRepos>>[number];

type BackstageProjectRowProps = {
  project: Project;
  isPrivate: boolean | null;
  disabled?: boolean;
};

function attendanceLabel(attendance: string) {
  return attendance.replaceAll("_", " ");
}

export function BackstageProjectRow({ project, isPrivate, disabled }: BackstageProjectRowProps) {
  const visibilityMutation = useMutation({
    mutationFn: (visibility: "public" | "private") =>
      setGithubRepoVisibilityForBackstage({
        data: { repoFullName: project.repoFullName, visibility },
      }),
    onSuccess(_result, visibility) {
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: project.repoFullName,
      });
    },
    onError(err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    },
    meta: { invalidates: backstageRepoMutationInvalidates },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeProjectRepo({ data: { repoFullName: project.repoFullName } }),
    onSuccess() {
      toast.success("Removed from projects", { description: project.repoFullName });
    },
    onError(err: unknown) {
      toast.error("Remove failed", { description: unwrapUnknownError(err).message });
    },
    meta: { invalidates: backstageRepoMutationInvalidates },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteGithubRepoForBackstage({ data: { repoFullName: project.repoFullName } }),
    onSuccess() {
      toast.success("Repository deleted", { description: project.repoFullName });
    },
    onError(err: unknown) {
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    },
    meta: { invalidates: backstageRepoMutationInvalidates },
  });

  const actionsDisabled =
    disabled ||
    visibilityMutation.isPending ||
    removeMutation.isPending ||
    deleteMutation.isPending;

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
            isPending={visibilityMutation.isPending}
            onConfirm={(visibility) => visibilityMutation.mutate(visibility)}
          />
        ) : null}

        <RepoRemoveButton
          repoFullName={project.repoFullName}
          disabled={actionsDisabled}
          isPending={removeMutation.isPending}
          onConfirm={() => removeMutation.mutate()}
        />

        <RepoDeleteButton
          repoFullName={project.repoFullName}
          disabled={actionsDisabled}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
        />
      </div>
    </div>
  );
}
