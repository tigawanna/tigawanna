"use client";

import { useId, useState } from "react";
import { Button, Drawer, DrawerToggler, toast, useForm, useModal } from "@payloadcms/ui";

const DRAWER_SLUG = "import-markdown-blog";

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

type FromMarkdownResponse = {
  content: unknown;
  title: string | null;
};

/**
 * Edit-view action: paste markdown into a drawer and apply it to the form.
 */
export function ImportMarkdownAction() {
  const markdownId = useId();
  const applyTitleId = useId();
  const { dispatchFields, setModified } = useForm();
  const { closeModal } = useModal();

  const [markdown, setMarkdown] = useState("");
  const [applyTitle, setApplyTitle] = useState(true);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <DrawerToggler slug={DRAWER_SLUG} className="btn btn--style-secondary btn--size-medium">
        Import markdown
      </DrawerToggler>

      <Drawer slug={DRAWER_SLUG} title="Import markdown">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "0.5rem 0 1.5rem",
            maxWidth: "42rem",
          }}
        >
          <p style={{ margin: 0, opacity: 0.85 }}>
            Paste markdown (Dev.to / GitHub style is fine). It replaces the Content field in this
            edit form. A leading <code># Title</code> can also update the Title field.
          </p>

          <label htmlFor={markdownId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span>Markdown</span>
            <textarea
              id={markdownId}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={"# My post title\n\nIntro paragraph…\n\n```ts\nconst x = 1\n```"}
              disabled={busy}
              rows={16}
              style={{
                padding: "0.6rem 0.75rem",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.85rem",
                resize: "vertical",
              }}
            />
          </label>

          <label
            htmlFor={applyTitleId}
            style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}
          >
            <input
              id={applyTitleId}
              type="checkbox"
              checked={applyTitle}
              onChange={(e) => setApplyTitle(e.target.checked)}
              disabled={busy}
            />
            <span>Apply leading # heading to Title field</span>
          </label>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button
              buttonStyle="primary"
              disabled={busy || markdown.trim().length < 1}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await fetch("/api/blogs/from-markdown", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      markdown: markdown.trim(),
                      applyTitle,
                    }),
                  });

                  if (!res.ok) {
                    throw new Error(await readErrorMessage(res));
                  }

                  const result = (await res.json()) as FromMarkdownResponse;
                  dispatchFields({ type: "UPDATE", path: "content", value: result.content });
                  if (applyTitle && result.title) {
                    dispatchFields({ type: "UPDATE", path: "title", value: result.title });
                  }
                  setModified(true);

                  toast.success("Markdown imported into the form");
                  closeModal(DRAWER_SLUG);
                  setMarkdown("");
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : "Import markdown failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Importing…" : "Import"}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
