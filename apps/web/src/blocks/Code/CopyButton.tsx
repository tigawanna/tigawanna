"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

/**
 * Copies a code snippet to the clipboard and briefly confirms success.
 */
export function CopyButton({ code }: { code: string }) {
  const [label, setLabel] = useState("Copy");

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-base-content/15 bg-base-100/80 px-2.5 py-1 text-xs text-base-content/70 transition-colors hover:border-base-content/30 hover:text-base-content"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setLabel("Copied!");
        window.setTimeout(() => setLabel("Copy"), 1000);
      }}
    >
      <Copy className="size-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
