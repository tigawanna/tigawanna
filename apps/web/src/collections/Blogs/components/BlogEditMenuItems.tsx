"use client";

import { useState } from "react";
import { PopupList, toast, useFormFields, useModal } from "@payloadcms/ui";

import { IMPORT_MARKDOWN_DRAWER_SLUG, ImportMarkdownAction } from "./ImportMarkdownAction";
import { SMART_REFINE_DRAWER_SLUG, SmartRefineAction } from "./SmartRefineAction";

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
 * Blog edit ⋯ menu items: Smart refine, Copy markdown, Import markdown.
 *
 * Drawers are mounted here so `openModal` can show them from the dropdown.
 */
export function BlogEditMenuItems() {
  const { openModal } = useModal();
  const [copying, setCopying] = useState(false);
  const title = useFormFields(([fields]) => fields.title?.value);
  const content = useFormFields(([fields]) => fields.content?.value);
  const titleText = typeof title === "string" ? title.trim() : "";

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

      <SmartRefineAction />
      <ImportMarkdownAction />
    </>
  );
}
