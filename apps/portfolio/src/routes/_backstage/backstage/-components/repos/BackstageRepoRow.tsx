import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  deleteBackstageGithubRepoMutationOptions,
  importBackstageProjectMutationOptions,
  setBackstageRepoVisibilityMutationOptions,
} from "@/data-access-layer/backstage/projects/projects-mutation-options";
import { isGithubRepoDeletePermissionError } from "@/routes/_backstage/backstage/-utils/github-repo-delete-errors";
import type { ImportProjectOptions } from "@/routes/_backstage/backstage/-utils/import-options";
import type { BackstageGithubRepo } from "@/types/backstage";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Eye, GitFork, Lock, RefreshCcw, Star } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { RepoDeleteButton } from "../shared/RepoDeleteButton";
import { RepoVisibilityButton } from "../shared/RepoVisibilityButton";
import { AdminPatDialog } from "./AdminPatDialog";
import { ImportRepoDialog } from "./ImportRepoDialog";

type BackstageRepoRowProps = {
  repo: BackstageGithubRepo;
  isImported: boolean;
};

export function BackstageRepoRow({ repo, isImported }: BackstageRepoRowProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [adminPatOpen, setAdminPatOpen] = useState(false);

  const importMutation = useMutation(importBackstageProjectMutationOptions);
  const visibilityMutation = useMutation(setBackstageRepoVisibilityMutationOptions);
  const deleteMutation = useMutation({
    ...deleteBackstageGithubRepoMutationOptions,
    onSuccess(data, variables, onMutateResult, context) {
      deleteBackstageGithubRepoMutationOptions.onSuccess?.(
        data,
        variables,
        onMutateResult,
        context,
      );
      setAdminPatOpen(false);
    },
    onError(err: unknown, variables, onMutateResult, context) {
      if (isGithubRepoDeletePermissionError(err)) {
        setAdminPatOpen(true);
        return;
      }
      deleteBackstageGithubRepoMutationOptions.onError?.(err, variables, onMutateResult, context);
    },
  });

  const actionsDisabled =
    importMutation.isPending || visibilityMutation.isPending || deleteMutation.isPending;

  const showImported = isImported || importMutation.isPending;

  const handleImport = (options: ImportProjectOptions) => {
    importMutation.mutate(options);
  };

  return (
    <>
      <ImportRepoDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        repoFullName={repo.nameWithOwner}
        isImporting={importMutation.isPending}
        onConfirm={handleImport}
      />

      <AdminPatDialog
        open={adminPatOpen}
        onOpenChange={setAdminPatOpen}
        repoFullName={repo.nameWithOwner}
        isRetrying={deleteMutation.isPending}
        onRetry={(pat) =>
          deleteMutation.mutate({ nameWithOwner: repo.nameWithOwner, overridePat: pat })
        }
      />

      <div className="flex flex-wrap items-start gap-4 px-4 py-4" data-test="github-repo-row">
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
            {showImported ? (
              <Badge variant="secondary" data-test="repo-imported-badge">
                Imported
              </Badge>
            ) : null}
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
          {showImported ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-test="reimport-repo"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={actionsDisabled}
                  onClick={() => setImportOpen(true)}
                  aria-label="Reimport to projects"
                >
                  <RefreshCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reimport to projects</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              data-test="import-repo"
              size="sm"
              disabled={actionsDisabled}
              onClick={() => setImportOpen(true)}
            >
              {importMutation.isPending ? "Importing…" : "Import"}
            </Button>
          )}

          <RepoVisibilityButton
            repoFullName={repo.nameWithOwner}
            isPrivate={repo.isPrivate}
            disabled={actionsDisabled}
            isPending={visibilityMutation.isPending}
            onConfirm={(visibility) =>
              visibilityMutation.mutate({ nameWithOwner: repo.nameWithOwner, visibility })
            }
          />

          <RepoDeleteButton
            repoFullName={repo.nameWithOwner}
            disabled={actionsDisabled}
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate({ nameWithOwner: repo.nameWithOwner })}
          />
        </div>
      </div>
    </>
  );
}
