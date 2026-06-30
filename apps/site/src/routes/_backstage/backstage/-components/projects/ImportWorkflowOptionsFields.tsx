import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { isServerEmbeddingAvailableInClient } from "@/lib/envs/server-embedding";
import type { ImportWorkflowOptions } from "@/routes/_backstage/backstage/-utils/import-options";

type ImportWorkflowOptionsFieldsProps = {
  idPrefix: string;
  options: ImportWorkflowOptions;
  onChange: (next: ImportWorkflowOptions) => void;
  showForceEnrichment?: boolean;
};

/**
 * Shared enrichment and embedding checkboxes for import dialogs.
 */
export function ImportWorkflowOptionsFields({
  idPrefix,
  options,
  onChange,
  showForceEnrichment = true,
}: ImportWorkflowOptionsFieldsProps) {
  const serverEmbeddingAvailable = isServerEmbeddingAvailableInClient();

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

      <div className="flex items-start gap-3">
        <Checkbox
          id={`${idPrefix}-run-embedding`}
          data-test={`${idPrefix}-run-embedding`}
          checked={options.runEmbedding}
          disabled={!serverEmbeddingAvailable}
          onCheckedChange={(checked) => patch({ runEmbedding: checked === true })}
        />
        <div className="grid gap-1">
          <Label htmlFor={`${idPrefix}-run-embedding`}>Run Gemma embeddings</Label>
          <p className="text-base-content/60 text-sm">
            {serverEmbeddingAvailable
              ? "Introspects README and nested package.json files, then indexes vectors for search. Runs locally after enrichment."
              : "Server-side embedding is disabled in production. Run bulk imports locally in dev to index vectors."}
          </p>
        </div>
      </div>

      {serverEmbeddingAvailable ? (
        <div className="border-base-content/10 ml-7 flex flex-col gap-3 border-l pl-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${idPrefix}-skip-embedding-if-complete`}
              data-test={`${idPrefix}-skip-embedding-if-complete`}
              checked={options.skipEmbeddingIfComplete}
              disabled={!options.runEmbedding || options.forceEmbedding}
              onCheckedChange={(checked) => patch({ skipEmbeddingIfComplete: checked === true })}
            />
            <div className="grid gap-1">
              <Label htmlFor={`${idPrefix}-skip-embedding-if-complete`}>
                Skip if already complete
              </Label>
              <p className="text-base-content/60 text-sm">
                Skip embedding when description and tags exist on GitHub or in the README.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id={`${idPrefix}-force-embedding`}
              data-test={`${idPrefix}-force-embedding`}
              checked={options.forceEmbedding}
              disabled={!options.runEmbedding}
              onCheckedChange={(checked) => {
                const forceEmbedding = checked === true;
                patch({
                  forceEmbedding,
                  skipEmbeddingIfComplete: forceEmbedding ? false : options.skipEmbeddingIfComplete,
                });
              }}
            />
            <div className="grid gap-1">
              <Label htmlFor={`${idPrefix}-force-embedding`}>Re-embed anyway</Label>
              <p className="text-base-content/60 text-sm">
                Force a fresh embedding run even when tags and description are present.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
