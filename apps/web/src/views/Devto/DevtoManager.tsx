"use client";

import { useEffect, useState } from "react";
import { Button, Gutter, toast, useConfig } from "@payloadcms/ui";

import type { ImportDevtoArticleResult } from "@/modules/devto/import-from-devto";
import type { DevtoOverview, DevtoOverviewRow } from "@/modules/devto/overview";

import { DevtoArticlesTable } from "./DevtoArticlesTable";
import { Chip, adminFetch, inputStyle, mutedStyle, panelStyle } from "./devto-admin-ui";

/**
 * Returns a copy of `set` with `value` added or removed.
 */
function toggled<T>(set: ReadonlySet<T>, value: T, on: boolean): Set<T> {
  const next = new Set(set);
  if (on) next.add(value);
  else next.delete(value);
  return next;
}

/**
 * Admin Dev.to page: every published Dev.to article next to its local blog,
 * with a per-article import and duplicate cleanup.
 */
export function DevtoManager() {
  const { config } = useConfig();
  const adminRoute = config.routes.admin;

  const [overview, setOverview] = useState<DevtoOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [busyArticles, setBusyArticles] = useState<ReadonlySet<number>>(new Set());
  const [deletingBlogs, setDeletingBlogs] = useState<ReadonlySet<number>>(new Set());
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const loadOverview = async () => {
    setRefreshing(true);
    try {
      setOverview(await adminFetch<DevtoOverview>("/api/blogs/devto/overview"));
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load Dev.to articles");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const patchRow = (row: DevtoOverviewRow) => {
    setOverview((current) =>
      current
        ? { ...current, rows: current.rows.map((r) => (r.articleId === row.articleId ? row : r)) }
        : current,
    );
  };

  const importArticle = async (articleId: number) => {
    setBusyArticles((ids) => toggled(ids, articleId, true));
    try {
      const result = await adminFetch<ImportDevtoArticleResult>("/api/blogs/devto/import", {
        method: "POST",
        body: { articleId },
      });
      patchRow(result.row);
      setRowErrors(({ [articleId]: _cleared, ...rest }) =>
        result.canonicalError
          ? { ...rest, [articleId]: `Imported, but canonical failed: ${result.canonicalError}` }
          : rest,
      );
      toast.success(`${result.action === "created" ? "Imported" : "Updated"} ${result.slug}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Import failed";
      setRowErrors((errors) => ({ ...errors, [articleId]: message }));
      toast.error(message);
    } finally {
      setBusyArticles((ids) => toggled(ids, articleId, false));
    }
  };

  const deleteDuplicate = async (blogId: number, slug: string) => {
    if (!window.confirm(`Delete duplicate blog "${slug}"? This can't be undone.`)) return;
    setDeletingBlogs((ids) => toggled(ids, blogId, true));
    try {
      await adminFetch(`/api/blogs/${blogId}`, { method: "DELETE" });
      setOverview((current) =>
        current
          ? {
              ...current,
              rows: current.rows.map((row) => ({
                ...row,
                duplicates: row.duplicates.filter((dup) => dup.id !== blogId),
              })),
            }
          : current,
      );
      toast.success(`Deleted ${slug}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to delete ${slug}`);
    } finally {
      setDeletingBlogs((ids) => toggled(ids, blogId, false));
    }
  };

  if (!overview) {
    return (
      <Gutter>
        <DevtoHeader />
        <div style={{ ...panelStyle, padding: "2rem", textAlign: "center" }}>
          {loadError ? (
            <>
              <p style={{ color: "var(--theme-error-500)", margin: 0 }}>{loadError}</p>
              <Button buttonStyle="secondary" size="small" onClick={() => void loadOverview()}>
                Retry
              </Button>
            </>
          ) : (
            <span style={{ opacity: 0.7 }}>Loading Dev.to articles…</span>
          )}
        </div>
      </Gutter>
    );
  }

  const { rows, config: devtoConfig } = overview;
  const needle = query.trim().toLowerCase();
  const visibleRows = needle
    ? rows.filter(
        (row) =>
          row.title.toLowerCase().includes(needle) ||
          row.devtoSlug.toLowerCase().includes(needle) ||
          row.local?.slug.toLowerCase().includes(needle),
      )
    : rows;

  return (
    <Gutter>
      <div style={{ paddingBottom: "3rem" }}>
        <DevtoHeader />

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <Chip tone="neutral">
              @{overview.username} · {rows.length} articles
            </Chip>
            <Chip
              tone={devtoConfig.hasApiKey ? "success" : "warning"}
              title="DEV_TO_KEY — needed to fix Dev.to canonical URLs"
            >
              API key {devtoConfig.hasApiKey ? "set" : "missing"}
            </Chip>
            <Chip
              tone={devtoConfig.canonicalOrigin ? "success" : "warning"}
              title="Canonical URLs are written as {origin}/blogs/{slug}"
            >
              Canonical: {devtoConfig.canonicalOrigin ?? "off"}
            </Chip>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or slug…"
              style={{ ...inputStyle, minWidth: "14rem" }}
              data-test="devto-search"
            />
            <Button
              buttonStyle="secondary"
              size="small"
              margin={false}
              disabled={refreshing}
              onClick={() => void loadOverview()}
              extraButtonProps={{ "data-test": "devto-refresh" }}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        <DevtoArticlesTable
          rows={visibleRows}
          adminRoute={adminRoute}
          busyIds={busyArticles}
          deletingIds={deletingBlogs}
          rowErrors={rowErrors}
          onImport={(articleId) => void importArticle(articleId)}
          onDeleteDuplicate={(blogId, slug) => void deleteDuplicate(blogId, slug)}
        />

        <p style={{ ...mutedStyle, marginTop: "0.75rem" }}>
          Loaded {new Date(overview.fetchedAt).toLocaleTimeString()}
        </p>
      </div>
    </Gutter>
  );
}

/**
 * Page title + one-line explanation (shared by loading and loaded states).
 */
function DevtoHeader() {
  return (
    <header className="list-header" style={{ marginBottom: "1rem" }}>
      <div className="list-header__content">
        <div className="list-header__title-and-actions">
          <h1 className="list-header__title">Dev.to</h1>
        </div>
        <p style={{ margin: "0.35rem 0 0", opacity: 0.75, maxWidth: "46rem" }}>
          Every published Dev.to article and the blog it maps to here. Import or update one
          article at a time.
        </p>
      </div>
    </header>
  );
}
