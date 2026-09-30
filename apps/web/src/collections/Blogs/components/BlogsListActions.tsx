"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, toast, useConfig } from "@payloadcms/ui";

import type { ImportFromDevtoResult } from "@/modules/devto/import-from-devto";

/** Safety cap on chained import calls (each is time-boxed server-side). */
const MAX_IMPORT_RUNS = 20;

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
 * Runs one time-boxed import batch against the Blogs endpoint.
 */
async function requestImportBatch(body: {
  force: boolean;
  since?: string;
}): Promise<ImportFromDevtoResult> {
  const res = await fetch("/api/blogs/import-from-devto", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as ImportFromDevtoResult;
}

/**
 * Chains import batches until nothing remains or a batch makes no progress.
 * Returns totals plus the failures from the final batch (the ones still failing).
 */
async function importAllFromDevto(
  force: boolean,
  onProgress: (imported: number, remaining: number) => void,
) {
  let since: string | undefined;
  let created = 0;
  let updated = 0;
  let canonicalUpdated = 0;
  let seriesCreated = 0;

  for (let run = 0; run < MAX_IMPORT_RUNS; run += 1) {
    const batch = await requestImportBatch({ force, since });
    since = batch.since;
    created += batch.created;
    updated += batch.updated;
    canonicalUpdated += batch.canonicalUpdated;
    seriesCreated += batch.seriesCreated;
    onProgress(created + updated, batch.remaining);

    const madeProgress = batch.created + batch.updated > 0;
    if (batch.remaining === 0 || !madeProgress) {
      return { ...batch, created, updated, canonicalUpdated, seriesCreated };
    }
  }

  throw new Error(`Dev.to import still incomplete after ${MAX_IMPORT_RUNS} runs — try again.`);
}

/**
 * Blogs list toolbar: Smart draft + import published posts from Dev.to.
 *
 * Rendered via `admin.components.beforeList` so actions stay visible on the
 * collection list (including production).
 */
export function BlogsListActions() {
  const { config } = useConfig();
  const router = useRouter();
  const smartDraftHref = `${config.routes.admin}/smart-draft`;
  const [progress, setProgress] = useState<string | null>(null);
  const busy = progress !== null;

  const runImport = async (force: boolean) => {
    setProgress("Importing…");
    try {
      const result = await importAllFromDevto(force, (imported, remaining) => {
        setProgress(`Importing… ${imported} done, ${remaining} left`);
      });

      const parts = [
        `${result.created} new`,
        `${result.updated} updated`,
        `${result.skipped} unchanged`,
      ];
      if (result.seriesCreated > 0) parts.push(`${result.seriesCreated} series added`);
      if (result.canonicalUpdated > 0) {
        parts.push(`${result.canonicalUpdated} Dev.to canonical URLs set`);
      }
      if (result.remaining > 0) parts.push(`${result.remaining} not reached`);
      if (result.failed.length > 0) parts.push(`${result.failed.length} failed`);
      const summary = `Dev.to @${result.username}: ${parts.join(", ")}`;

      if (result.failed.length > 0 || result.remaining > 0) {
        const failedSlugs = result.failed.map((f) => f.slug).join(", ");
        toast.error(failedSlugs ? `${summary} (${failedSlugs}) — re-run to retry` : summary);
      } else {
        toast.success(summary);
      }
      if (result.duplicates.length > 0) {
        const list = result.duplicates
          .map((d) => `${d.duplicates.join(", ")} (duplicate of ${d.slug})`)
          .join("; ");
        toast.warning(`Duplicate blogs found — safe to delete: ${list}`);
      }
      if (result.created + result.updated > 0) router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Import from Dev.to failed");
    } finally {
      setProgress(null);
    }
  };

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
          <strong>Import from Dev.to</strong> pulls new and edited published articles (create or
          update by slug); failures retry on the next run. <strong>Force re-import</strong> refreshes
          every article. <strong>Smart draft</strong> generates a new post from notes.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <Button
          buttonStyle="primary"
          disabled={busy}
          onClick={() => runImport(false)}
          extraButtonProps={{ "data-test": "blogs-import-devto" }}
        >
          {progress ?? "Import from Dev.to"}
        </Button>

        <Button
          buttonStyle="secondary"
          disabled={busy}
          onClick={() => runImport(true)}
          extraButtonProps={{ "data-test": "blogs-import-devto-force" }}
        >
          Force re-import
        </Button>

        <a
          href={smartDraftHref}
          className="btn btn--style-secondary btn--size-medium"
          data-test="blogs-smart-draft"
        >
          Smart draft
        </a>
      </div>
    </div>
  );
}
