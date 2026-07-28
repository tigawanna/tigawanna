"use client";

import { useState } from "react";
import { Button, toast, useDocumentInfo, useFormFields } from "@payloadcms/ui";

type ActionBusy = "open" | "sync" | null;

type OpenResponse = {
  articleId: number;
  url: string;
  editUrl: string;
  created: boolean;
};

type SyncResponse = {
  articleId: number;
  url: string;
  title: string;
  coverUrl: string | null;
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
 * Resolves nested `devto.*` values from Payload form field state.
 */
function readDevtoField(
  fields: Record<string, { value?: unknown } | undefined>,
  key: "articleId" | "url",
): unknown {
  const flat = fields[`devto.${key}`]?.value;
  if (flat !== undefined && flat !== null && flat !== "") return flat;

  const group = fields.devto?.value;
  if (group && typeof group === "object" && key in group) {
    return (group as Record<string, unknown>)[key];
  }
  return undefined;
}

/**
 * Admin actions: seed/update a Dev.to draft, or pull Dev.to content back into Payload.
 */
export function DevtoActions() {
  const { id, collectionSlug } = useDocumentInfo();
  const kind = useFormFields(([fields]) => fields.kind?.value);
  const articleId = useFormFields(([fields]) => readDevtoField(fields, "articleId"));
  const devtoUrl = useFormFields(([fields]) => readDevtoField(fields, "url"));
  const [busy, setBusy] = useState<ActionBusy>(null);

  if (kind !== "post") {
    return null;
  }

  if (!id || collectionSlug !== "blogs") {
    return (
      <p style={{ margin: "0 0 1rem", opacity: 0.75 }}>
        Save this post once before using Dev.to actions.
      </p>
    );
  }

  const linked =
    typeof articleId === "number" || (typeof articleId === "string" && articleId.trim() !== "");

  /**
   * POSTs to a blogs custom endpoint with the admin session cookie.
   */
  async function callEndpoint<T>(path: string): Promise<T> {
    const res = await fetch(`/api/blogs/${id}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }
    return res.json() as Promise<T>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "1.25rem",
        padding: "1rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div>
        <strong>Dev.to workflow</strong>
        <p style={{ margin: "0.35rem 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
          <strong>Publish to Dev.to</strong> creates a Dev.to <em>draft</em> from this post (Payload
          stays as-is) and opens the Dev.to editor so you can add the cover / images. Then{" "}
          <strong>Sync from Dev.to</strong> pulls those assets back here. Also available from the
          document ⋯ menu. Canonical URL points at <code>/blogs/…</code>.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <Button
          buttonStyle="primary"
          disabled={busy !== null}
          onClick={async () => {
            setBusy("open");
            try {
              const result = await callEndpoint<OpenResponse>("/open-devto");
              toast.success(
                result.created
                  ? "Dev.to draft created — finish cover & images there"
                  : "Dev.to draft updated",
              );
              window.open(result.editUrl, "_blank", "noopener,noreferrer");
              window.location.reload();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Publish to Dev.to failed");
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "open" ? "Publishing…" : linked ? "Update & open Dev.to" : "Publish to Dev.to"}
        </Button>

        <Button
          buttonStyle="secondary"
          disabled={busy !== null || !linked}
          onClick={async () => {
            setBusy("sync");
            try {
              const result = await callEndpoint<SyncResponse>("/sync-devto");
              toast.success(`Synced “${result.title}” from Dev.to`);
              window.location.reload();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Sync from Dev.to failed");
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "sync" ? "Syncing…" : "Sync from Dev.to"}
        </Button>

        {typeof devtoUrl === "string" && devtoUrl ? (
          <a
            href={devtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.9rem" }}
          >
            View on Dev.to ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}
