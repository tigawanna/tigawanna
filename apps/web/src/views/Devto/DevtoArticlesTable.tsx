"use client";

import { Button } from "@payloadcms/ui";

import type { DevtoOverviewRow } from "@/modules/devto/overview";

import {
  CANONICAL_LABELS,
  Chip,
  SYNC_LABELS,
  mutedStyle,
  panelStyle,
  shortDate,
  tdStyle,
  thStyle,
} from "./devto-admin-ui";

type DevtoArticlesTableProps = {
  rows: DevtoOverviewRow[];
  adminRoute: string;
  busyIds: ReadonlySet<number>;
  deletingIds: ReadonlySet<number>;
  rowErrors: Readonly<Record<number, string>>;
  onImport: (articleId: number) => void;
  onDeleteDuplicate: (blogId: number, slug: string) => void;
};

/**
 * Label for the row's main action, based on its sync state.
 */
function importLabel(row: DevtoOverviewRow): string {
  if (row.sync === "missing") return "Import";
  if (row.sync === "synced" && row.canonical !== "outdated") return "Re-sync";
  return "Update";
}

/**
 * Dev.to articles matched to local blogs, with per-row import and duplicate cleanup.
 */
export function DevtoArticlesTable({
  rows,
  adminRoute,
  busyIds,
  deletingIds,
  rowErrors,
  onImport,
  onDeleteDuplicate,
}: DevtoArticlesTableProps) {
  if (rows.length === 0) {
    return (
      <div style={{ ...panelStyle, padding: "2rem", textAlign: "center", opacity: 0.7 }}>
        No articles match this filter.
      </div>
    );
  }

  return (
    <div style={{ ...panelStyle, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr>
            <th style={thStyle}>Dev.to article</th>
            <th style={thStyle}>Local blog</th>
            <th style={thStyle}>Content</th>
            <th style={thStyle}>Canonical</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const sync = SYNC_LABELS[row.sync];
            const canonical = CANONICAL_LABELS[row.canonical];
            const busy = busyIds.has(row.articleId);
            const error = rowErrors[row.articleId];
            const canonicalHint =
              row.canonical === "outdated"
                ? `${canonical.hint}\nNow: ${row.canonicalUrl ?? "(none)"}\nWill be: ${row.desiredCanonicalUrl}`
                : `${canonical.hint}\n${row.canonicalUrl ?? "(none)"}`;

            return (
              <tr key={row.articleId} data-test="devto-article-row">
                <td style={{ ...tdStyle, minWidth: "18rem" }}>
                  <div style={{ fontWeight: 600 }}>{row.title}</div>
                  <div style={{ ...mutedStyle, marginTop: "0.2rem" }}>
                    <a href={row.devtoUrl} target="_blank" rel="noreferrer">
                      {row.devtoSlug} ↗
                    </a>
                    {" · "}
                    published {shortDate(row.publishedAt)}
                    {row.editedAt ? ` · edited ${shortDate(row.editedAt)}` : ""}
                  </div>
                  {row.collectionId !== null ? (
                    <div style={{ marginTop: "0.35rem" }}>
                      <Chip tone="neutral" title={`Dev.to series ${row.collectionId}`}>
                        Series: {row.seriesTitle ?? "created on import"}
                      </Chip>
                    </div>
                  ) : null}
                  {error ? (
                    <div
                      role="alert"
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.8rem",
                        color: "var(--theme-error-500)",
                      }}
                    >
                      {error}
                    </div>
                  ) : null}
                </td>

                <td style={{ ...tdStyle, minWidth: "14rem" }}>
                  {row.local ? (
                    <>
                      <a href={`${adminRoute}/collections/blogs/${row.local.id}`}>
                        {row.local.slug}
                      </a>
                      <div style={{ ...mutedStyle, marginTop: "0.2rem" }}>
                        {row.local.status} · synced {shortDate(row.local.lastSyncedAt)}
                      </div>
                    </>
                  ) : (
                    <span style={mutedStyle}>—</span>
                  )}
                  {row.duplicates.map((dup) => (
                    <div
                      key={dup.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.45rem",
                      }}
                    >
                      <Chip tone="error" title="Another blog points at this Dev.to article">
                        Duplicate
                      </Chip>
                      <a href={`${adminRoute}/collections/blogs/${dup.id}`} style={mutedStyle}>
                        {dup.slug}
                      </a>
                      <Button
                        buttonStyle="error"
                        size="small"
                        margin={false}
                        disabled={deletingIds.has(dup.id)}
                        onClick={() => onDeleteDuplicate(dup.id, dup.slug)}
                        extraButtonProps={{ "data-test": "devto-delete-duplicate" }}
                      >
                        {deletingIds.has(dup.id) ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  ))}
                </td>

                <td style={tdStyle}>
                  <Chip tone={sync.tone} title={sync.hint}>
                    {sync.label}
                  </Chip>
                </td>

                <td style={tdStyle}>
                  <Chip tone={canonical.tone} title={canonicalHint}>
                    {canonical.label}
                  </Chip>
                </td>

                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Button
                    buttonStyle={importLabel(row) === "Re-sync" ? "secondary" : "primary"}
                    size="small"
                    margin={false}
                    disabled={busy}
                    onClick={() => onImport(row.articleId)}
                    extraButtonProps={{ "data-test": "devto-import-article" }}
                  >
                    {busy ? "Working…" : importLabel(row)}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
