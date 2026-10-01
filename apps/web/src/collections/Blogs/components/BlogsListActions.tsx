"use client";

import { useConfig } from "@payloadcms/ui";

/**
 * Blogs list toolbar: links to the Dev.to page and Smart draft.
 *
 * Rendered via `admin.components.beforeList` so actions stay visible on the
 * collection list (including production).
 */
export function BlogsListActions() {
  const { config } = useConfig();
  const adminRoute = config.routes.admin;

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
          <strong>Dev.to</strong> lists every published Dev.to article and imports them one at a
          time. <strong>Smart draft</strong> generates a new post from notes.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <a
          href={`${adminRoute}/devto`}
          className="btn btn--style-primary btn--size-medium"
          data-test="blogs-devto-page"
        >
          Dev.to
        </a>
        <a
          href={`${adminRoute}/smart-draft`}
          className="btn btn--style-secondary btn--size-medium"
          data-test="blogs-smart-draft"
        >
          Smart draft
        </a>
      </div>
    </div>
  );
}
