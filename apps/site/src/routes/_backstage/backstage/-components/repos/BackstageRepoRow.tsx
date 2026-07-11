import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteBackstageGithubRepo,
  setBackstageRepoVisibility,
} from "@/data-access-layer/backstage/projects/backstage-collection-mutations";
import { cn } from "@/lib/utils";
import { isGithubRepoDeletePermissionError } from "@/routes/_backstage/backstage/-utils/github-repo-delete-errors";
import type { ImportProjectOptions } from "@/routes/_backstage/backstage/-utils/import-options";
import type { BackstageGithubRepo } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Eye, GitFork, Loader, Lock, Star } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { RepoDeleteButton } from "../shared/RepoDeleteButton";
import { RepoVisibilityButton } from "../shared/RepoVisibilityButton";
import { AdminPatDialog } from "./AdminPatDialog";
import { ImportRepoDialog } from "./ImportRepoDialog";

type BackstageRepoRowProps = {
  repo: BackstageGithubRepo;
  isTracked: boolean;
  isImporting: boolean;
  onImport: (options: ImportProjectOptions) => void;
  disabled?: boolean;
};

export function BackstageRepoRow({
  repo,
  isTracked,
  isImporting,
  onImport,
  disabled,
}: BackstageRepoRowProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [adminPatOpen, setAdminPatOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"visibility" | "delete" | null>(null);

  const actionsDisabled = disabled || pendingAction != null || isImporting;

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

  const handleDelete = async (overridePat?: string) => {
    setPendingAction("delete");
    try {
      await deleteBackstageGithubRepo(
        repo.nameWithOwner,
        overridePat ? { overridePat } : undefined,
      );
      toast.success("Repository deleted", { description: repo.nameWithOwner });
      setAdminPatOpen(false);
    } catch (err: unknown) {
      if (isGithubRepoDeletePermissionError(err)) {
        setAdminPatOpen(true);
        return;
      }
      toast.error("Delete failed", { description: unwrapUnknownError(err).message });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <>
      <ImportRepoDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        repoFullName={repo.nameWithOwner}
        isTracked={isTracked}
        isImporting={isImporting}
        onConfirm={onImport}
      />

      <AdminPatDialog
        open={adminPatOpen}
        onOpenChange={setAdminPatOpen}
        repoFullName={repo.nameWithOwner}
        isRetrying={pendingAction === "delete"}
        onRetry={(pat) => void handleDelete(pat)}
      />

      <div
        className={cn(
          "flex flex-wrap items-start gap-4 px-4 py-4",
          isImporting && "bg-primary/5 border-primary/20 border-y",
        )}
        data-test="github-repo-row"
        data-working={isImporting ? "true" : undefined}
      >
        {repo.openGraphImageUrl ? (
          <img
            src={repo.openGraphImageUrl}
            alt=""
            className="border-base-content/10 size-16 shrink-0 rounded-lg border object-cover"
          />
        ) : (
          <div className="bg-base-200 border-base-content/10 flex size-16 shrink-0 items-center justify-center rounded-lg border">
            <FaGithub className="text-base-content/40 size-6" aria-hidden />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FaGithub className="text-base-content/50 size-3.5 shrink-0" aria-hidden />
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline"
            >
              {repo.nameWithOwner}
            </a>
            {isImporting ? (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary gap-1"
                data-test="repo-working-badge"
              >
                <Loader className="size-3 animate-spin" />
                Working…
              </Badge>
            ) : null}
            {isTracked ? (
              <Badge variant="secondary" data-test="repo-tracked-badge">
                In projects
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                data-test="repo-untracked-badge"
              >
                Not imported
              </Badge>
            )}
            <Badge variant="outline" className="gap-1" data-test="repo-visibility-badge">
              {repo.isPrivate ? (
                <>
                  <Lock className="size-3" />
                  Private
                </>
              ) : (
                <>
                  <Eye className="size-3" />
                  Public
                </>
              )}
            </Badge>
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
            disabled={actionsDisabled}
            onClick={() => setImportOpen(true)}
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
            onConfirm={() => void handleDelete()}
          />
        </div>
      </div>
    </>
  );
}
