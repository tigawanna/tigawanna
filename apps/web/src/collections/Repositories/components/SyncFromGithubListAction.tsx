"use client";

import { useState } from "react";
import { Button, toast } from "@payloadcms/ui";

type SyncResponse = {
  created: number;
  updated: number;
  featured: number;
  total: number;
  pulledAt: string;
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
 * Repositories list toolbar: pull pinned + recent repos from GitHub into Payload.
 *
 * Rendered via `admin.components.beforeList` so it is always visible on the
 * collection list view (no DOM portal required).
 */
export function SyncFromGithubListAction() {
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
        <strong>GitHub cache</strong>
        <p style={{ margin: "0.25rem 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
          Pull pinned + recent public repos into this collection. Safe to run anytime — including
          production — when the live GitHub API is rate-limited.
        </p>
      </div>

      <Button
        buttonStyle="primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch("/api/repositories/sync-from-github", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
              throw new Error(await readErrorMessage(res));
            }
            const result = (await res.json()) as SyncResponse;
            toast.success(
              `Pulled ${result.total} repos (${result.created} new, ${result.updated} updated, ${result.featured} featured)`,
            );
            window.location.reload();
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Pull from GitHub failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Pulling…" : "Pull from GitHub"}
      </Button>
    </div>
  );
}
