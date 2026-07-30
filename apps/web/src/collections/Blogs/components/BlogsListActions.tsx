"use client";

import { useState } from "react";
import { Button, toast, useConfig } from "@payloadcms/ui";

type ImportResponse = {
  username: string;
  expected: number;
  created: number;
  updated: number;
  failed: number;
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
 * Blogs list toolbar: Smart draft + re-import published posts from Dev.to.
 *
 * Rendered via `admin.components.beforeList` so actions stay visible on the
 * collection list (including production).
 */
export function BlogsListActions() {
  const { config } = useConfig();
  const smartDraftHref = `${config.routes.admin}/smart-draft`;
  const [busy, setBusy] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        marginBottom: "1rem",
        padding: "0.875rem 1rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 16rem" }}>
        <strong>Blog tools</strong>
        <p style={{ margin: "0.25rem 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
          <strong>Import from Dev.to</strong> pulls all published articles into this collection
          (create or update by slug). Safe to re-run anytime. <strong>Smart draft</strong> generates
          a new post from notes.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <Button
          buttonStyle="primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await fetch("/api/blogs/import-from-devto", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });
              if (!res.ok) {
                throw new Error(await readErrorMessage(res));
              }
              const result = (await res.json()) as ImportResponse;
              const summary = `Imported @${result.username}: ${result.created} new, ${result.updated} updated${
                result.failed > 0 ? `, ${result.failed} failed` : ""
              }`;
              if (result.failed > 0) {
                toast.error(summary);
              } else {
                toast.success(summary);
              }
              window.location.reload();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Import from Dev.to failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Importing…" : "Import from Dev.to"}
        </Button>

        <a href={smartDraftHref} className="btn btn--style-secondary btn--size-medium">
          Smart draft
        </a>
      </div>
    </div>
  );
}
