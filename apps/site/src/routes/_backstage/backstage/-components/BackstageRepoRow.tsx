import {
  deleteBackstageGithubRepo,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage-collection-mutations";
import type { BackstageGithubRepo } from "@/types/backstage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { unwrapUnknownError } from "@/utils/errors";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { useState } from "react";
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
  const [pendingAction, setPendingAction] = useState<"visibility" | "delete" | null>(null);

  const actionsDisabled = disabled || pendingAction != null;

  const handleVisibility = async (visibility: "public" | "private") => {
    setPendingAction("visibility");
    try {
      await setBackstageRepoVisibility(repo.nameWithOwner, visibility);
      toast.success(visibility === "private" ? "Repo is now private" : "Repo is now public", {
        description: repo.nameWithOwner,
      });
    } catch (err: unknown) {
      toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    setPendingAction("delete");
    try {
      await deleteBackstageGithubRepo(repo.nameWithOwner);
      toast.success("Repository deleted", { description: repo.nameWithOwner });
    } catch (err: unknown) {
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

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
          isPending={pendingAction === "visibility"}
          onConfirm={handleVisibility}
        />

        <RepoDeleteButton
          repoFullName={repo.nameWithOwner}
          disabled={actionsDisabled}
          isPending={pendingAction === "delete"}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
