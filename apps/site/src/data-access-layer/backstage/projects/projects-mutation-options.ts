import {
  bulkImportBackstageProjects,
  deleteBackstageGithubRepo,
  importBackstageProject,
  setBackstageRepoVisibility,
  type BulkImportBackstageProjectsInput,
  type ImportBackstageProjectInput,
} from "@/data-access-layer/backstage/projects/backstage-collection-mutations";
import { unwrapUnknownError } from "@/utils/errors";
import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export type SetBackstageRepoVisibilityInput = {
  nameWithOwner: string;
  visibility: "public" | "private";
};

export type DeleteBackstageGithubRepoInput = {
  nameWithOwner: string;
  overridePat?: string;
};

export const importBackstageProjectMutationOptions = mutationOptions({
  mutationFn: (input: ImportBackstageProjectInput) => importBackstageProject(input),
  onSuccess(_result, variables) {
    toast.success("Imported to projects", { description: variables.repoFullName });
  },
  onError(err: unknown) {
    toast.error("Import failed", { description: unwrapUnknownError(err).message });
  },
});

export const bulkImportBackstageProjectsMutationOptions = mutationOptions({
  mutationFn: (input: BulkImportBackstageProjectsInput) => bulkImportBackstageProjects(input),
  onSuccess(result) {
    toast.success(`Imported ${result.importedCount} repos`, {
      description: result.runId ? "Workflow running…" : "Import only",
    });
  },
  onError(err: unknown) {
    toast.error("Bulk import failed", { description: unwrapUnknownError(err).message });
  },
});

export const setBackstageRepoVisibilityMutationOptions = mutationOptions({
  mutationFn: ({ nameWithOwner, visibility }: SetBackstageRepoVisibilityInput) =>
    setBackstageRepoVisibility(nameWithOwner, visibility),
  onSuccess(_result, variables) {
    toast.success(
      variables.visibility === "private" ? "Repo is now private" : "Repo is now public",
      { description: variables.nameWithOwner },
    );
  },
  onError(err: unknown) {
    toast.error("Visibility update failed", { description: unwrapUnknownError(err).message });
  },
});

export const deleteBackstageGithubRepoMutationOptions = mutationOptions({
  mutationFn: ({ nameWithOwner, overridePat }: DeleteBackstageGithubRepoInput) =>
    deleteBackstageGithubRepo(nameWithOwner, overridePat ? { overridePat } : undefined),
  onSuccess(_result, variables) {
    toast.success("Repository deleted", { description: variables.nameWithOwner });
  },
  onError(err: unknown) {
    toast.error("Delete failed", { description: unwrapUnknownError(err).message });
  },
});
