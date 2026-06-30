import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { BackstageGithubRepo } from "@/types/backstage";
import type { ImportJobOptions } from "@/routes/_backstage/backstage/-hooks/use-import-queue";
import { Download, Loader } from "lucide-react";
import { useState } from "react";

type ImportProjectDialogProps = {
  repo: BackstageGithubRepo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: ImportJobOptions) => void;
  isBusy?: boolean;
};

export function ImportProjectDialog({
  repo,
  open,
  onOpenChange,
  onConfirm,
  isBusy,
}: ImportProjectDialogProps) {
  const [runEnrichment, setRunEnrichment] = useState(true);
  const [runEmbedding, setRunEmbedding] = useState(true);
  const [skipEmbeddingIfComplete, setSkipEmbeddingIfComplete] = useState(true);
  const [forceEmbedding, setForceEmbedding] = useState(false);

  if (!repo) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm({
      repoFullName: repo.nameWithOwner,
      runEnrichment,
      runEmbedding,
      skipEmbeddingIfComplete,
      forceEmbedding,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-test="import-project-dialog">
        <DialogHeader>
          <DialogTitle>Import {repo.nameWithOwner}</DialogTitle>
          <DialogDescription>
            Add this repo to projects and optionally run metadata enrichment or Gemma embeddings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="import-run-enrichment"
              data-test="import-run-enrichment"
              checked={runEnrichment}
              onCheckedChange={(checked) => setRunEnrichment(checked === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="import-run-enrichment">Run metadata enrichment</Label>
              <p className="text-base-content/60 text-sm">
                Starts the enrichment workflow to infer missing description and tags.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="import-run-embedding"
              data-test="import-run-embedding"
              checked={runEmbedding}
              onCheckedChange={(checked) => setRunEmbedding(checked === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="import-run-embedding">Run Gemma embeddings</Label>
              <p className="text-base-content/60 text-sm">
                Introspects README and nested package.json files, then indexes vectors for search.
              </p>
            </div>
          </div>

          <div className="border-base-content/10 ml-7 flex flex-col gap-3 border-l pl-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="import-skip-embedding-if-complete"
                data-test="import-skip-embedding-if-complete"
                checked={skipEmbeddingIfComplete}
                disabled={!runEmbedding || forceEmbedding}
                onCheckedChange={(checked) => setSkipEmbeddingIfComplete(checked === true)}
              />
              <div className="grid gap-1">
                <Label htmlFor="import-skip-embedding-if-complete">Skip if already complete</Label>
                <p className="text-base-content/60 text-sm">
                  Skip embedding when description and tags exist on GitHub or in the README.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="import-force-embedding"
                data-test="import-force-embedding"
                checked={forceEmbedding}
                disabled={!runEmbedding}
                onCheckedChange={(checked) => {
                  const next = checked === true;
                  setForceEmbedding(next);
                  if (next) {
                    setSkipEmbeddingIfComplete(false);
                  }
                }}
              />
              <div className="grid gap-1">
                <Label htmlFor="import-force-embedding">Re-embed anyway</Label>
                <p className="text-base-content/60 text-sm">
                  Force a fresh embedding run even when tags and description are present.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-test="import-project-confirm"
            disabled={isBusy}
            onClick={handleConfirm}
            className="gap-1.5"
          >
            {isBusy ? (
              <>
                <Loader className="size-3.5 animate-spin" />
                Queue busy…
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                Import project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
