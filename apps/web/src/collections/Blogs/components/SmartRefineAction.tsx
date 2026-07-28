"use client";

import { useEffect, useId, useState } from "react";
import { Button, Drawer, toast, useForm, useFormFields, useModal } from "@payloadcms/ui";

type AiDraftStatus = {
  configured: boolean;
  defaultModel: string;
};

type AiDraftModel = {
  id: string;
  name: string;
};

type AiDraftModelsResponse = {
  configured: boolean;
  defaultModel: string;
  models: AiDraftModel[];
};

type RefineResponse = {
  title: string;
  description: string;
  content: unknown;
  model: string;
};

export const SMART_REFINE_DRAWER_SLUG = "smart-refine-blog";

/**
 * Reads a JSON error body from a failed Payload API response.
 */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      if ("errors" in data && Array.isArray(data.errors) && data.errors[0]?.message) {
        return String(data.errors[0].message);
      }
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  } catch {
    // fall through
  }
  return `Request failed (${res.status})`;
}

/**
 * Smart refine drawer (opened from the document ⋯ menu).
 */
export function SmartRefineAction() {
  const instructionId = useId();
  const modelId = useId();
  const { dispatchFields, setModified } = useForm();
  const { closeModal } = useModal();

  const title = useFormFields(([fields]) => fields.title?.value);
  const description = useFormFields(([fields]) => fields.description?.value);
  const content = useFormFields(([fields]) => fields.content?.value);

  const [status, setStatus] = useState<AiDraftStatus | null>(null);
  const [models, setModels] = useState<AiDraftModel[]>([]);
  const [instruction, setInstruction] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [statusRes, modelsRes] = await Promise.all([
          fetch("/api/blogs/ai-draft/status", { credentials: "include" }),
          fetch("/api/blogs/ai-draft/models", { credentials: "include" }),
        ]);

        if (!statusRes.ok) throw new Error(await readErrorMessage(statusRes));
        if (!modelsRes.ok) throw new Error(await readErrorMessage(modelsRes));

        const statusJson = (await statusRes.json()) as AiDraftStatus;
        const modelsJson = (await modelsRes.json()) as AiDraftModelsResponse;

        if (cancelled) return;

        setStatus(statusJson);
        setModels(modelsJson.models);
        setModel((prev) => prev || modelsJson.defaultModel || statusJson.defaultModel);
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load Smart refine settings");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const configured = status?.configured === true;
  const titleText = typeof title === "string" ? title : "";
  const descriptionText = typeof description === "string" ? description : "";

  return (
    <Drawer slug={SMART_REFINE_DRAWER_SLUG} title="Smart refine">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "0.5rem 0 1.5rem",
          maxWidth: "40rem",
        }}
      >
        {!configured ? (
          <p style={{ margin: 0, opacity: 0.85 }}>
            Set <code>OPENROUTER_API_KEY</code> in <code>apps/web/.env</code> to enable Smart
            refine.
          </p>
        ) : (
          <p style={{ margin: 0, opacity: 0.85 }}>
            Tell the model what to change. It refines the current title, description, and content in
            this edit form (unsaved until you publish / save draft).
          </p>
        )}

        <label htmlFor={instructionId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>What should we refine?</span>
          <textarea
            id={instructionId}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Tighten the intro, add a Next.js App Router code example, cut the SEO fluff..."
            disabled={!configured || busy}
            rows={8}
            style={{ padding: "0.6rem 0.75rem", fontFamily: "inherit", resize: "vertical" }}
          />
        </label>

        <label htmlFor={modelId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Model</span>
          <select
            id={modelId}
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setCustomModel("");
            }}
            disabled={!configured || busy || models.length === 0}
            style={{ padding: "0.6rem 0.75rem" }}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name === m.id ? m.id : `${m.name} - ${m.id}`}
              </option>
            ))}
          </select>
          <input
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="Optional custom model id (overrides select)"
            disabled={!configured || busy}
            style={{ padding: "0.6rem 0.75rem" }}
          />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            buttonStyle="primary"
            disabled={
              !configured ||
              busy ||
              instruction.trim().length < 5 ||
              !titleText.trim() ||
              !descriptionText.trim() ||
              !content
            }
            onClick={async () => {
              setBusy(true);
              try {
                const res = await fetch("/api/blogs/ai-refine", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: titleText.trim(),
                    description: descriptionText.trim(),
                    content,
                    instruction: instruction.trim(),
                    model: customModel.trim() || model.trim() || undefined,
                  }),
                });

                if (!res.ok) {
                  throw new Error(await readErrorMessage(res));
                }

                const result = (await res.json()) as RefineResponse;

                dispatchFields({ type: "UPDATE", path: "title", value: result.title });
                dispatchFields({
                  type: "UPDATE",
                  path: "description",
                  value: result.description,
                });
                dispatchFields({ type: "UPDATE", path: "content", value: result.content });
                setModified(true);

                toast.success("Refined draft applied to the form");
                closeModal(SMART_REFINE_DRAWER_SLUG);
                setInstruction("");
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Smart refine failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Refining…" : "Refine"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
