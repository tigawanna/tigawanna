import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ImportWorkflowOptions } from "@/routes/_backstage/backstage/-utils/import-options";

type ImportWorkflowOptionsFieldsProps = {
  idPrefix: string;
  options: ImportWorkflowOptions;
  onChange: (next: ImportWorkflowOptions) => void;
  showForceEnrichment?: boolean;
};

/**
 * Shared enrichment checkboxes for import dialogs.
 * Embeddings run via local CLI only — not offered in the Vercel workflow.
 */
export function ImportWorkflowOptionsFields({
  idPrefix,
  options,
  onChange,
  showForceEnrichment = true,
}: ImportWorkflowOptionsFieldsProps) {
  const patch = (partial: Partial<ImportWorkflowOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`${idPrefix}-run-enrichment`}
          data-test={`${idPrefix}-run-enrichment`}
          checked={options.runEnrichment}
          onCheckedChange={(checked) => patch({ runEnrichment: checked === true })}
        />
        <div className="grid gap-1">
          <Label htmlFor={`${idPrefix}-run-enrichment`}>Run metadata enrichment</Label>
          <p className="text-base-content/60 text-sm">
            Starts the enrichment workflow to infer missing description and tags.
          </p>
        </div>
      </div>

      {showForceEnrichment ? (
        <div className="border-base-content/10 ml-7 flex flex-col gap-3 border-l pl-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${idPrefix}-force-enrichment`}
              data-test={`${idPrefix}-force-enrichment`}
              checked={options.forceEnrichment}
              disabled={!options.runEnrichment}
              onCheckedChange={(checked) => patch({ forceEnrichment: checked === true })}
            />
            <div className="grid gap-1">
              <Label htmlFor={`${idPrefix}-force-enrichment`}>Re-enrich even when complete</Label>
              <p className="text-base-content/60 text-sm">
                Regenerate enrichment suggestions even when GitHub already has description and
                topics.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-base-content/50 text-sm" data-test={`${idPrefix}-embed-cli-hint`}>
        Embeddings are indexed locally with the embed CLI after import — not on the server.
      </p>
    </div>
  );
}
