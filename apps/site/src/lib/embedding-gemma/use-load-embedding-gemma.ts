import { unwrapUnknownError } from "@/utils/errors";
import type { ProgressInfo } from "@repo/gemma-embedding/web";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type WebGemma = Awaited<
  ReturnType<typeof import("@repo/gemma-embedding/web").createWebGemmaEmbedding>
>;

type ModelStatus = "idle" | "loading" | "ready" | "error";

/**
 * Loads the Gemma embedding model in the browser (WASM) with progress tracking.
 */
export function useLoadEmbeddingGemma(options?: { autoLoad?: boolean }) {
  const autoLoad = options?.autoLoad ?? true;
  const [model, setModel] = useState<WebGemma | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  const [modelProgress, setModelProgress] = useState<string | null>(null);

  const loadModel = async () => {
    setModelStatus("loading");
    setModelProgress("Starting model download…");

    try {
      const { createWebGemmaEmbedding } = await import("@repo/gemma-embedding/web");
      const instance = createWebGemmaEmbedding({
        onProgress(info: ProgressInfo) {
          if (info.status === "loading" && info.progress != null) {
            setModelProgress(`Loading model… ${info.progress}%`);
          }
          if (info.status === "ready") {
            setModelProgress("Model ready");
          }
          if (info.status === "error") {
            setModelProgress(info.error ?? "Model load failed");
          }
        },
      });

      await instance.load();
      setModel(instance);
      setModelStatus("ready");
      toast.success("Gemma model loaded in browser");
    } catch (err: unknown) {
      setModelStatus("error");
      toast.error("Failed to load Gemma model", {
        description: unwrapUnknownError(err).message,
      });
    }
  };

  useEffect(() => {
    if (autoLoad) {
      void loadModel();
    }
  }, [autoLoad]);

  return { model, modelStatus, modelProgress, loadModel };
}
