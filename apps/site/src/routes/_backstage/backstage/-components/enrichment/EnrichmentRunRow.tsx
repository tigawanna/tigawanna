import { Badge } from "@/components/ui/badge";
import type { ProjectEnrichmentRunRow } from "@repo/db";
import { format, formatDistanceStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

function parseTargetRepos(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return null;
  }
}

function statusBadgeVariant(status: ProjectEnrichmentRunRow["status"]) {
  switch (status) {
    case "completed":
      return "outline" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

type EnrichmentRunRowProps = {
  run: ProjectEnrichmentRunRow;
};

export function EnrichmentRunRow({ run }: EnrichmentRunRowProps) {
  const targetRepos = parseTargetRepos(run.targetRepos);
  const startedAt = new Date(run.startedAt);
  const finishedAt = run.finishedAt ? new Date(run.finishedAt) : null;
  const duration = finishedAt != null ? formatDistanceStrict(finishedAt, startedAt) : null;

  return (
    <div
      className="flex flex-col gap-3 px-4 py-4"
      data-test="enrichment-run-row"
      data-run-status={run.status}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-medium">{run.id}</span>
            <Badge variant={statusBadgeVariant(run.status)} className="capitalize">
              {run.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {run.trigger}
            </Badge>
          </div>
          <p className="text-base-content/60 text-sm">
            Started {format(startedAt, "PPp")}
            {finishedAt ? ` · Finished ${format(finishedAt, "PPp")}` : " · In progress"}
            {duration ? ` · ${duration}` : null}
          </p>
        </div>
        <dl className="grid shrink-0 grid-cols-3 gap-3 text-right text-sm">
          <div>
            <dt className="text-base-content/50 text-xs">Synced</dt>
            <dd className="font-medium tabular-nums">{run.reposSynced}</dd>
          </div>
          <div>
            <dt className="text-base-content/50 text-xs">Skipped</dt>
            <dd className="font-medium tabular-nums">{run.reposSkipped}</dd>
          </div>
          <div>
            <dt className="text-base-content/50 text-xs">Enriched</dt>
            <dd className="font-medium tabular-nums">{run.reposEnriched}</dd>
          </div>
        </dl>
      </div>

      {targetRepos != null ? (
        <p className="text-base-content/70 text-sm">
          <span className="text-base-content/50">Targets: </span>
          {targetRepos.length > 0 ? targetRepos.join(", ") : "Scan by limit"}
        </p>
      ) : (
        <p className="text-base-content/70 text-sm">
          <span className="text-base-content/50">Targets: </span>
          GitHub discovery scan
        </p>
      )}

      {run.error ? (
        <p
          className={twMerge(
            "rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive",
          )}
          data-test="enrichment-run-error"
        >
          {run.error}
        </p>
      ) : null}
    </div>
  );
}
