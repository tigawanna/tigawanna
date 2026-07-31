"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Button, Gutter, toast } from "@payloadcms/ui";

import { jobInputLabel, type JobListItem } from "@/jobs/job-list-item";

const PAGE_SIZE = 60;

type JobsListResponse = {
  ok: boolean;
  jobs: JobListItem[];
  counts: {
    waiting: number;
    queued: number;
    processing: number;
    succeeded: number;
    failed: number;
  };
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error?: string;
};

type QueueFilter = "github" | "all" | "github-sync" | "github-enrich" | "default";

/**
 * Formats an ISO timestamp for compact display.
 *
 * @param value - ISO date string or null.
 */
function shortTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Reads a JSON error body from a failed API response.
 *
 * @param res - Fetch response.
 */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      if ("error" in data && typeof data.error === "string") return data.error;
      if ("message" in data && typeof data.message === "string") return data.message;
    }
  } catch {
    // fall through
  }
  return `Request failed (${res.status})`;
}

/**
 * Whether a job can be executed from the row action.
 *
 * @param status - Derived lifecycle label.
 */
function canRun(status: JobListItem["status"]): boolean {
  return status === "waiting" || status === "queued" || status === "failed";
}

/**
 * Admin panel: poll GitHub job queues and run one job at a time from a row.
 */
export function JobsProgressPanel() {
  const [queue, setQueue] = useState<QueueFilter>("github");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [counts, setCounts] = useState<JobsListResponse["counts"] | null>(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/jobs?queue=${queue}&page=${page}&limit=${PAGE_SIZE}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await readErrorMessage(res));
        const body = (await res.json()) as JobsListResponse;
        if (cancelled) return;
        setJobs(body.jobs);
        setCounts(body.counts);
        setTotalDocs(body.totalDocs);
        setTotalPages(Math.max(body.totalPages || 1, 1));
        setHasNextPage(body.hasNextPage);
        setHasPrevPage(body.hasPrevPage);
        if (body.page && body.page !== page) {
          setPage(body.page);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to list jobs");
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [queue, page]);

  async function runGithubAction(action: "sync" | "enrich-run") {
    setActionBusy(action);
    try {
      const res = await fetch("/api/jobs/github", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const data: unknown = await res.json();
      if (action === "sync") {
        const jobId =
          typeof data === "object" && data !== null && "jobId" in data ? data.jobId : "?";
        toast.success(`Metadata sync job ${String(jobId)} finished`);
      } else {
        toast.success("Enrich runner finished one due job (or none were due)");
      }
      setPage(1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionBusy(null);
    }
  }

  async function runOneJob(jobId: number) {
    setRunningId(jobId);
    try {
      const res = await fetch("/api/jobs/github", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-job", jobId }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      toast.success(`Ran job ${jobId}`);
      setPage(1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to run job ${jobId}`);
    } finally {
      setRunningId(null);
    }
  }

  const selected = jobs.find((j) => j.id === selectedId) ?? null;
  const rangeStart = totalDocs === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalDocs);

  return (
    <Gutter>
      <div style={{ paddingBottom: "2.5rem" }}>
        <header className="list-header" style={{ marginBottom: "1.25rem" }}>
          <div className="list-header__content">
            <div className="list-header__title-and-actions">
              <h1 className="list-header__title">Jobs progress</h1>
            </div>
            <p style={{ margin: "0.35rem 0 0", opacity: 0.75, maxWidth: "42rem" }}>
              GitHub sync / enrich queues. Polls every 2s ({PAGE_SIZE}/page). Processing jobs sort
              first. Use <strong>Run</strong> on a row to execute that one job immediately.
            </p>
          </div>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
            {counts
              ? `this page: waiting ${counts.waiting} · queued ${counts.queued} · processing ${counts.processing} · ok ${counts.succeeded} · failed ${counts.failed}`
              : "Loading…"}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={queue}
              onChange={(e) => {
                setQueue(e.target.value as QueueFilter);
                setPage(1);
              }}
              style={{
                height: "2rem",
                padding: "0 0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--theme-elevation-150)",
                background: "var(--theme-input-bg)",
                color: "var(--theme-text)",
              }}
            >
              <option value="github">github (both)</option>
              <option value="github-sync">github-sync</option>
              <option value="github-enrich">github-enrich</option>
              <option value="default">default</option>
              <option value="all">all</option>
            </select>

            <Button
              buttonStyle="primary"
              size="small"
              disabled={actionBusy != null}
              onClick={() => void runGithubAction("sync")}
            >
              {actionBusy === "sync" ? "Syncing…" : "Run metadata sync"}
            </Button>
            <Button
              buttonStyle="secondary"
              size="small"
              disabled={actionBusy != null}
              onClick={() => void runGithubAction("enrich-run")}
            >
              {actionBusy === "enrich-run" ? "Running…" : "Run enrich once"}
            </Button>
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: "4px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--theme-elevation-50)", textAlign: "left" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Queue</th>
                <th style={thStyle}>Task / workflow</th>
                <th style={thStyle}>Target</th>
                <th style={thStyle}>Wait until</th>
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, opacity: 0.6 }}>
                    No jobs yet for this filter.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const label = jobInputLabel(job.input);
                  const kind = job.workflowSlug ?? job.taskSlug ?? "—";
                  const runnable = canRun(job.status);
                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedId(job.id)}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedId === job.id
                            ? "var(--theme-elevation-100)"
                            : job.status === "processing"
                              ? "color-mix(in srgb, var(--theme-success-500) 12%, transparent)"
                              : undefined,
                      }}
                    >
                      <td style={tdStyle}>
                        <code>{job.id}</code>
                      </td>
                      <td style={tdStyle}>{job.status}</td>
                      <td style={tdStyle}>{job.queue ?? "default"}</td>
                      <td style={tdStyle}>{kind}</td>
                      <td style={{ ...tdStyle, maxWidth: "12rem" }} title={label ?? undefined}>
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label ?? "—"}
                        </span>
                      </td>
                      <td style={tdStyle}>{shortTime(job.waitUntil)}</td>
                      <td style={tdStyle}>{shortTime(job.updatedAt)}</td>
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <Button
                          buttonStyle="secondary"
                          size="small"
                          disabled={!runnable || runningId != null}
                          onClick={() => void runOneJob(job.id)}
                        >
                          {runningId === job.id ? "Running…" : "Run"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginTop: "0.85rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
            {totalDocs === 0
              ? "0 jobs"
              : `Showing ${rangeStart}–${rangeEnd} of ${totalDocs} · page ${page}/${totalPages}`}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              buttonStyle="secondary"
              size="small"
              disabled={!hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              buttonStyle="secondary"
              size="small"
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {selected ? (
          <pre
            style={{
              marginTop: "1rem",
              padding: "1rem",
              overflowX: "auto",
              borderRadius: "4px",
              background: "var(--theme-elevation-50)",
              border: "1px solid var(--theme-elevation-150)",
              fontSize: "0.75rem",
              lineHeight: 1.45,
            }}
          >
            {JSON.stringify(selected, null, 2)}
          </pre>
        ) : null}
      </div>
    </Gutter>
  );
}

const thStyle: CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "0.55rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
  verticalAlign: "middle",
};
