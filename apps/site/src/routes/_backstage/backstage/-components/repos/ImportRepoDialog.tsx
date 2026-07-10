import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  defaultSingleImportWorkflowOptions,
  type ImportProjectOptions,
  type ImportWorkflowOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { Download, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { ImportWorkflowOptionsFields } from "./ImportWorkflowOptionsFields";

type ImportRepoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoFullName: string;
  isTracked: boolean;
  isImporting?: boolean;
  onConfirm: (options: ImportProjectOptions) => void;
};

/**
 * Single-repo import dialog with enrichment workflow options.
 */
export function ImportRepoDialog({
  open,
  onOpenChange,
  repoFullName,
  isTracked,
  isImporting,
  onConfirm,
}: ImportRepoDialogProps) {
  const [options, setOptions] = useState<ImportWorkflowOptions>(() =>
    defaultSingleImportWorkflowOptions(),
  );

  useEffect(() => {
    if (!open) {
      setOptions(defaultSingleImportWorkflowOptions());
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm({
      repoFullName,
      ...options,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-test="import-repo-dialog">
        <DialogHeader>
          <DialogTitle>
            {isTracked ? "Re-import" : "Import"} {repoFullName}
          </DialogTitle>
          <DialogDescription>
            {isTracked
              ? "Refresh the project record from GitHub and optionally re-run enrichment."
              : "Add this repo to projects and optionally run enrichment or embeddings."}
          </DialogDescription>
        </DialogHeader>

        <ImportWorkflowOptionsFields
          idPrefix="import-repo"
          options={options}
          onChange={setOptions}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-test="import-repo-confirm"
            disabled={isImporting}
            onClick={handleConfirm}
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
                {isTracked ? "Re-import" : "Import"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
