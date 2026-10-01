import type { CSSProperties, ReactNode } from "react";

import type { DevtoCanonicalState, DevtoSyncState } from "@/modules/devto/overview";

export type ChipTone = "success" | "warning" | "error" | "neutral";

/**
 * Reads a JSON error body (Payload `{ errors: [{ message }] }` or `{ message }`).
 */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      if ("errors" in data && Array.isArray(data.errors) && data.errors[0]?.message) {
        return String(data.errors[0].message);
      }
      if ("message" in data && typeof data.message === "string") return data.message;
      if ("error" in data && typeof data.error === "string") return data.error;
    }
  } catch {
    // fall through
  }
  return `Request failed (${res.status})`;
}

/**
 * Cookie-authenticated JSON request against the Payload REST API.
 */
export async function adminFetch<T>(
  url: string,
  init?: { method?: "GET" | "POST" | "DELETE"; body?: unknown },
): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    credentials: "include",
    headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as T;
}

/**
 * Formats an ISO date compactly, `—` when missing.
 */
export function shortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export const SYNC_LABELS: Record<DevtoSyncState, { label: string; tone: ChipTone; hint: string }> = {
  missing: { label: "Not imported", tone: "error", hint: "No local blog for this article yet." },
  outdated: {
    label: "Outdated",
    tone: "warning",
    hint: "Edited on Dev.to after the last import.",
  },
  series: {
    label: "Series unlinked",
    tone: "warning",
    hint: "Article is in a Dev.to series the local blog isn't linked to.",
  },
  synced: { label: "Up to date", tone: "success", hint: "Local copy matches Dev.to." },
};

export const CANONICAL_LABELS: Record<
  DevtoCanonicalState,
  { label: string; tone: ChipTone; hint: string }
> = {
  ok: { label: "Points here", tone: "success", hint: "Dev.to canonical is this site." },
  outdated: {
    label: "Needs fix",
    tone: "warning",
    hint: "Importing will point the Dev.to canonical at this site.",
  },
  foreign: {
    label: "Other site",
    tone: "neutral",
    hint: "Canonical points at another site — left alone.",
  },
  unmanaged: {
    label: "Not managed",
    tone: "neutral",
    hint: "Set DEV_TO_KEY and an https NEXT_PUBLIC_SITE_URL to manage canonicals.",
  },
};

/**
 * Small status pill tinted with Payload theme colors.
 */
export function Chip({
  tone,
  title,
  children,
}: {
  tone: ChipTone;
  title?: string;
  children: ReactNode;
}) {
  const color = tone === "neutral" ? "var(--theme-elevation-400)" : `var(--theme-${tone}-500)`;
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.1rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span
        aria-hidden
        style={{ width: "0.4rem", height: "0.4rem", borderRadius: "999px", background: color }}
      />
      {children}
    </span>
  );
}

export const panelStyle: CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
  background: "var(--theme-elevation-0)",
};

export const thStyle: CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  fontWeight: 600,
  textAlign: "left",
  whiteSpace: "nowrap",
  background: "var(--theme-elevation-50)",
};

export const tdStyle: CSSProperties = {
  padding: "0.65rem 0.75rem",
  borderBottom: "1px solid var(--theme-elevation-100)",
  verticalAlign: "top",
};

export const mutedStyle: CSSProperties = {
  fontSize: "0.8rem",
  opacity: 0.7,
};

export const inputStyle: CSSProperties = {
  height: "2rem",
  padding: "0 0.6rem",
  borderRadius: "4px",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-input-bg)",
  color: "var(--theme-text)",
};
