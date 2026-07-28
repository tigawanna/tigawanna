"use client";

import { useState } from "react";
import { PopupList, toast, useDocumentInfo, useFormFields, useModal } from "@payloadcms/ui";

import { IMPORT_MARKDOWN_DRAWER_SLUG, ImportMarkdownAction } from "./ImportMarkdownAction";
import { SMART_REFINE_DRAWER_SLUG, SmartRefineAction } from "./SmartRefineAction";

type DevtoBusy = "open" | "sync" | null;

type OpenResponse = {
  articleId: number;
  url: string;
  editUrl: string;
  created: boolean;
};

type SyncResponse = {
  articleId: number;
  url: string;
  title: string;
  coverUrl: string | null;
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
 * Copies text to the clipboard (with a textarea fallback).
 */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

/**
 * Resolves nested `devto.*` values from Payload form field state.
 */
function readDevtoField(
  fields: Record<string, { value?: unknown } | undefined>,
  key: "articleId" | "url",
): unknown {
  const flat = fields[`devto.${key}`]?.value;
  if (flat !== undefined && flat !== null && flat !== "") return flat;

  const group = fields.devto?.value;
  if (group && typeof group === "object" && key in group) {
    return (group as Record<string, unknown>)[key];
  }
  return undefined;
}

/**
 * Blog edit ⋯ menu: Smart refine, markdown, Publish/Sync Dev.to.
 *
 * Drawers are mounted here so `openModal` can show them from the dropdown.
 */
export function BlogEditMenuItems() {
  const { openModal } = useModal();
  const { id, collectionSlug } = useDocumentInfo();
  const [copying, setCopying] = useState(false);
  const [devtoBusy, setDevtoBusy] = useState<DevtoBusy>(null);

  const title = useFormFields(([fields]) => fields.title?.value);
  const content = useFormFields(([fields]) => fields.content?.value);
  const kind = useFormFields(([fields]) => fields.kind?.value);
  const articleId = useFormFields(([fields]) => readDevtoField(fields, "articleId"));

  const titleText = typeof title === "string" ? title.trim() : "";
  const isPost = kind === "post";
  const hasDoc = Boolean(id) && collectionSlug === "blogs";
  const linked =
    typeof articleId === "number" || (typeof articleId === "string" && articleId.trim() !== "");

  /**
   * POSTs to a blogs custom endpoint with the admin session cookie.
   */
  async function callDevtoEndpoint<T>(path: string): Promise<T> {
    const res = await fetch(`/api/blogs/${id}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }
    return res.json() as Promise<T>;
  }

  return (
    <>
      <PopupList.ButtonGroup>
        <PopupList.Button
          onClick={() => {
            openModal(SMART_REFINE_DRAWER_SLUG);
          }}
        >
          Smart refine
        </PopupList.Button>

        <PopupList.Button
          disabled={copying || !content}
          onClick={async () => {
            setCopying(true);
            try {
              const res = await fetch("/api/blogs/to-markdown", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: titleText || undefined,
                  content,
                }),
              });

              if (!res.ok) {
                throw new Error(await readErrorMessage(res));
              }

              const result = (await res.json()) as { markdown: string };
              await copyText(result.markdown);
              toast.success("Markdown copied to clipboard");
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Copy markdown failed");
            } finally {
              setCopying(false);
            }
          }}
        >
          {copying ? "Copying…" : "Copy markdown"}
        </PopupList.Button>

        <PopupList.Button
          onClick={() => {
            openModal(IMPORT_MARKDOWN_DRAWER_SLUG);
          }}
        >
          Import markdown
        </PopupList.Button>
      </PopupList.ButtonGroup>

      {isPost ? (
        <PopupList.ButtonGroup>
          <PopupList.Button
            disabled={devtoBusy !== null || !hasDoc}
            onClick={async () => {
              if (!hasDoc) {
                toast.error("Save the post once before publishing to Dev.to");
                return;
              }
              setDevtoBusy("open");
              try {
                const result = await callDevtoEndpoint<OpenResponse>("/open-devto");
                toast.success(
                  result.created
                    ? "Dev.to draft created — finish cover & images there"
                    : "Dev.to draft updated",
                );
                window.open(result.editUrl, "_blank", "noopener,noreferrer");
                window.location.reload();
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Publish to Dev.to failed");
              } finally {
                setDevtoBusy(null);
              }
            }}
          >
            {devtoBusy === "open"
              ? "Publishing to Dev.to…"
              : linked
                ? "Update & open Dev.to"
                : "Publish to Dev.to"}
          </PopupList.Button>

          <PopupList.Button
            disabled={devtoBusy !== null || !hasDoc || !linked}
            onClick={async () => {
              if (!linked) {
                toast.error("Publish to Dev.to first, then sync back after editing images");
                return;
              }
              setDevtoBusy("sync");
              try {
                const result = await callDevtoEndpoint<SyncResponse>("/sync-devto");
                toast.success(
                  result.coverUrl
                    ? `Synced “${result.title}” (cover set)`
                    : `Synced “${result.title}” — no cover image in Dev.to response`,
                );
                window.location.reload();
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Sync from Dev.to failed");
              } finally {
                setDevtoBusy(null);
              }
            }}
          >
            {devtoBusy === "sync" ? "Syncing…" : "Sync from Dev.to"}
          </PopupList.Button>
        </PopupList.ButtonGroup>
      ) : null}

      <SmartRefineAction />
      <ImportMarkdownAction />
    </>
  );
}
