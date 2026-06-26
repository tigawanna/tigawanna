import { backstageRepoMutationInvalidates } from "@/data-access-layer/backstage/projects-query-options";
import type { BackstageGithubRepo } from "@/lib/backstage/projects.functions";
import {
  deleteGithubRepoForBackstage,
  setGithubRepoVisibilityForBackstage,
} from "@/lib/backstage/projects.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { toast } from "sonner";
import { RepoDeleteButton } from "./RepoDeleteButton";
import { RepoVisibilityButton } from "./RepoVisibilityButton";

type BackstageRepoRowProps = {
  repo: BackstageGithubRepo;
  isTracked: boolean;
  isImporting: boolean;
  onImport: () => void;
  disabled?: boolean;
};

export function BackstageRepoRow({
  repo,
  isTracked,
  isImporting,
  onImport,
  disabled,
}: BackstageRepoRowProps) {
  const visibilityMutation = useMutation({
    mutationFn: (visibility: "public" | "private") =>
      setGithubRepoVisibilityForBackstage({
        data: { repoFullName: repo.nameWithOwner, visibility },
      }),
    onSuccess(_result, visibility) {
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: repo.nameWithOwner,
      });
    },
    onError(err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    },
    meta: { invalidates: backstageRepoMutationInvalidates },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteGithubRepoForBackstage({ data: { repoFullName: repo.nameWithOwner } }),
    onSuccess() {
      toast.success("Repository deleted", { description: repo.nameWithOwner });
    },
    onError(err: unknown) {
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    },
    meta: { invalidates: backstageRepoMutationInvalidates },
  });

  const actionsDisabled = disabled || visibilityMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-wrap items-start gap-4 px-4 py-4" data-test="github-repo-row">
      {repo.openGraphImageUrl ? (
        <img
          src={repo.openGraphImageUrl}
          alt=""
          className="border-base-content/10 size-16 shrink-0 rounded-lg border object-cover"
        />
      ) : (
        <div className="bg-base-200 border-base-content/10 size-16 shrink-0 rounded-lg border" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            {repo.nameWithOwner}
          </a>
          {isTracked ? (
            <Badge variant="secondary" data-test="repo-tracked-badge">
              In projects
            </Badge>
          ) : null}
          {repo.isArchived ? <Badge variant="outline">archived</Badge> : null}
          {repo.isFork ? <Badge variant="outline">fork</Badge> : null}
        </div>

        <p className="text-base-content/60 mt-1 text-sm">
          {repo.description || "(no description)"}
        </p>

        {repo.topics.length > 0 ? (
          <p className="text-base-content/45 mt-1 text-xs">{repo.topics.join(" · ")}</p>
        ) : null}

        <div className="text-base-content/40 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3" />
            {repo.stargazerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3" />
            {repo.forkCount}
          </span>
          <span>Pushed {formatDistanceToNow(new Date(repo.pushedAt), { addSuffix: true })}</span>
          {repo.homepageUrl ? (
            <a
              href={repo.homepageUrl}
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
        <Button
          data-test="import-repo"
          variant={isTracked ? "outline" : "default"}
          size="sm"
          disabled={actionsDisabled || isImporting}
          onClick={onImport}
        >
          {isImporting ? "Importing…" : isTracked ? "Re-import" : "Import"}
        </Button>

        <RepoVisibilityButton
          repoFullName={repo.nameWithOwner}
          isPrivate={repo.isPrivate}
          disabled={actionsDisabled}
          isPending={visibilityMutation.isPending}
          onConfirm={(visibility) => visibilityMutation.mutate(visibility)}
        />

        <RepoDeleteButton
          repoFullName={repo.nameWithOwner}
          disabled={actionsDisabled}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
        />
      </div>
    </div>
  );
}
