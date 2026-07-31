"use client";

import { useState } from "react";
import { Button, Link, toast, useConfig } from "@payloadcms/ui";

type SyncResponse = {
  ok: boolean;
  jobId: number | string;
  created: number;
  updated: number;
  upserted: number;
  queuedEnrich: number;
  featured: number;
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
 * Repositories list toolbar: queue GitHub metadata sync (+ staggered enrich jobs).
 *
 * Rendered via `admin.components.beforeList` so it is always visible on the
 * collection list view (no DOM portal required).
 */
export function SyncFromGithubListAction() {
  const { config } = useConfig();
  const [busy, setBusy] = useState(false);
  const jobsProgressHref = `${config.routes.admin}/jobs-progress`;

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
          Queue a metadata sync (pinned + recent). README / monorepo enrichment runs later via the
          jobs queue — inspect progress under{" "}
          <Link href={jobsProgressHref} prefetch={false}>
            Jobs progress
          </Link>
          . Safe to run anytime.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <Button buttonStyle="secondary" el="link" url={jobsProgressHref}>
          Jobs progress
        </Button>
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
                `Job ${result.jobId}: ${result.upserted} repos upserted (${result.created} new), ${result.queuedEnrich} enrich job(s) queued · ${result.featured} featured`,
              );
              window.location.reload();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Pull from GitHub failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Queuing…" : "Pull from GitHub"}
        </Button>
      </div>
    </div>
  );
}
