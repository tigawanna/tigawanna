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
  defaultBulkImportWorkflowOptions,
  type BulkImportProjectOptions,
  type ImportWorkflowOptions,
} from "@/routes/_backstage/backstage/-utils/import-options";
import { Download, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { ImportWorkflowOptionsFields } from "./ImportWorkflowOptionsFields";

type BulkImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoFullNames: string[];
  isImporting?: boolean;
  onConfirm: (options: BulkImportProjectOptions) => void;
};

export function BulkImportDialog({
  open,
  onOpenChange,
  repoFullNames,
  isImporting,
  onConfirm,
}: BulkImportDialogProps) {
  const [options, setOptions] = useState<ImportWorkflowOptions>(() =>
    defaultBulkImportWorkflowOptions(),
  );

  useEffect(() => {
    if (!open) {
      setOptions(defaultBulkImportWorkflowOptions());
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm({
      repoFullNames,
      ...options,
    });
    onOpenChange(false);
  };

  const repoCount = repoFullNames.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-test="bulk-import-dialog">
        <DialogHeader>
          <DialogTitle>Import all</DialogTitle>
          <DialogDescription>
            {repoCount === 0
              ? "No untracked repos in the current view."
              : `Import ${repoCount} untracked ${repoCount === 1 ? "repo" : "repos"} from the current filters and start one workflow.`}
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-4">
          <ImportWorkflowOptionsFields
            idPrefix="bulk-import"
            options={options}
            onChange={setOptions}
          />
        </section>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-test="bulk-import-confirm"
            disabled={isImporting || repoCount === 0}
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
                Import {repoCount || "all"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
