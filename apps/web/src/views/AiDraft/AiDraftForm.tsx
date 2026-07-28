"use client";

import { useEffect, useId, useState } from "react";
import { Button, Gutter, toast, useConfig } from "@payloadcms/ui";

type AiDraftStatus = {
  configured: boolean;
  defaultModel: string;
  fallbackModels: string[];
};

type AiDraftModel = {
  id: string;
  name: string;
  contextLength: number | null;
};

type AiDraftModelsResponse = {
  configured: boolean;
  defaultModel: string;
  models: AiDraftModel[];
};

type AiDraftCreateResponse = {
  id: number | string;
  title: string;
  slug: string | null | undefined;
  model: string;
};

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
 * Splits a textarea of URLs (one per line) into a clean list.
 */
function parseReferenceLines(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Hardcoded admin form: OpenRouter notes → draft blog post in Payload.
 */
export function AiDraftForm() {
  const { config } = useConfig();
  const titleId = useId();
  const notesId = useId();
  const refsId = useId();
  const modelId = useId();

  const [status, setStatus] = useState<AiDraftStatus | null>(null);
  const [models, setModels] = useState<AiDraftModel[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [references, setReferences] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const adminRoute = config.routes.admin;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingMeta(true);
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
          toast.error(err instanceof Error ? err.message : "Failed to load Smart draft settings");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const configured = status?.configured === true;

  return (
    <Gutter>
      <div style={{ maxWidth: "42rem", paddingBottom: "2.5rem" }}>
        <header className="list-header" style={{ marginBottom: "1.5rem" }}>
          <div className="list-header__content">
            <div className="list-header__title-and-actions">
              <h1 className="list-header__title">Smart draft</h1>
            </div>
          </div>
          <div className="list-header__after-header-content">
            <p style={{ margin: "0.35rem 0 0", opacity: 0.8 }}>
              Hardcoded admin page — not a CMS document. Expand notes into a draft blog post, then
              edit / Open in Dev.to / Sync / publish as usual.
            </p>
          </div>
        </header>

        {loadingMeta ? (
          <p style={{ opacity: 0.75 }}>Loading models…</p>
        ) : !configured ? (
          <p style={{ opacity: 0.85 }}>
            Set <code>OPENROUTER_API_KEY</code> in <code>apps/web/.env</code> (optional{" "}
            <code>OPENROUTER_MODEL</code>) to enable Smart draft.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label htmlFor={titleId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Title / topic</span>
              <input
                id={titleId}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why I moved my blog images to Dev.to"
                disabled={busy}
                style={{ padding: "0.6rem 0.75rem" }}
              />
            </label>

            <label htmlFor={notesId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Notes / outline</span>
              <textarea
                id={notesId}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  "Bullets, half-baked paragraphs, talking points…\nThe model will flesh this into an article."
                }
                disabled={busy}
                rows={12}
                style={{ padding: "0.6rem 0.75rem", fontFamily: "inherit", resize: "vertical" }}
              />
            </label>

            <label htmlFor={refsId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Reference links (optional, one per line)</span>
              <textarea
                id={refsId}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="https://…"
                disabled={busy}
                rows={3}
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
                disabled={busy || models.length === 0}
                style={{ padding: "0.6rem 0.75rem" }}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name === m.id ? m.id : `${m.name} — ${m.id}`}
                  </option>
                ))}
              </select>
              <input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Optional custom model id (overrides select)"
                disabled={busy}
                style={{ padding: "0.6rem 0.75rem" }}
              />
            </label>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <Button
                buttonStyle="primary"
                disabled={busy || !title.trim() || notes.trim().length < 10}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const refs = parseReferenceLines(references);
                    const res = await fetch("/api/blogs/ai-draft", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: title.trim(),
                        notes: notes.trim(),
                        model: customModel.trim() || model.trim() || undefined,
                        ...(refs.length > 0 ? { references: refs } : {}),
                      }),
                    });

                    if (!res.ok) {
                      throw new Error(await readErrorMessage(res));
                    }

                    const result = (await res.json()) as AiDraftCreateResponse;
                    toast.success(`Draft created: ${result.title}`);
                    window.location.assign(`${adminRoute}/collections/blogs/${result.id}`);
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : "Smart draft failed");
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Generating…" : "Generate draft"}
              </Button>

              <a
                href={`${adminRoute}/collections/blogs`}
                style={{ fontSize: "0.9rem", opacity: 0.85 }}
              >
                ← Back to Blogs
              </a>
            </div>
          </div>
        )}
      </div>
    </Gutter>
  );
}
