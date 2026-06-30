import { importBackstageProject } from "@/data-access-layer/backstage/backstage-collection-mutations";
import { indexProjectEmbedding } from "@/modules/backstage/embeddings.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const WORKFLOW_DELAY_MS = 2500;

export type ImportJobOptions = {
  repoFullName: string;
  runEnrichment: boolean;
  runEmbedding: boolean;
  skipEmbeddingIfComplete: boolean;
  forceEmbedding: boolean;
};

/**
 * Serial in-browser queue for project imports and post-import workflows.
 */
export function useImportQueue() {
  const queueRef = useRef<ImportJobOptions[]>([]);
  const processingRef = useRef(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [activeRepo, setActiveRepo] = useState<string | null>(null);

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    while (queueRef.current.length > 0) {
      const job = queueRef.current.shift()!;
      setQueuedCount(queueRef.current.length);
      setActiveRepo(job.repoFullName);

      try {
        const tx = importBackstageProject({
          repoFullName: job.repoFullName,
          runEnrichment: job.runEnrichment,
        });
        await tx.isPersisted.promise;

        if (job.runEnrichment) {
          await new Promise((resolve) => setTimeout(resolve, WORKFLOW_DELAY_MS));
        }

        if (job.runEmbedding) {
          if (job.runEnrichment) {
            await new Promise((resolve) => setTimeout(resolve, WORKFLOW_DELAY_MS));
          }

          const result = await indexProjectEmbedding({
            data: {
              repoFullName: job.repoFullName,
              skipIfComplete: job.skipEmbeddingIfComplete,
              force: job.forceEmbedding,
            },
          });

          if (result.status === "skipped") {
            toast.info("Embedding skipped", {
              description: result.reason ?? job.repoFullName,
            });
          }
        }

        toast.success("Imported to projects", { description: job.repoFullName });
      } catch (err: unknown) {
        toast.error("Import failed", { description: unwrapUnknownError(err).message });
      }
    }

    setActiveRepo(null);
    setQueuedCount(0);
    processingRef.current = false;
  }, []);

  const enqueue = useCallback(
    (job: ImportJobOptions) => {
      queueRef.current.push(job);
      setQueuedCount(queueRef.current.length);
      void processQueue();
    },
    [processQueue],
  );

  return {
    enqueue,
    queuedCount,
    activeRepo,
    isBusy: activeRepo != null,
  };
}
