"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CANVAS_VT_STYLES, type CanvasVtStyle } from "./_utils/vt-styles";
import "./view-transition/index.css";

/**
 * Canvas shell — VT style picker only on color morph routes.
 */
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showVtPicker =
    pathname === "/canvas" || /^\/canvas\/(red|green|blue|yellow)$/.test(pathname);
  const [style, setStyle] = useState<CanvasVtStyle>("wipe");

  useEffect(() => {
    if (!showVtPicker) {
      delete document.documentElement.dataset.style;
      return;
    }
    document.documentElement.dataset.style = style;
    return () => {
      delete document.documentElement.dataset.style;
    };
  }, [style, showVtPicker]);

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content">
      <header className="flex flex-col items-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">Next.js · canvas demos</h1>
        {showVtPicker ? (
          <>
            <div className="flex flex-wrap justify-center gap-2" data-test="canvas-style-picker">
              {CANVAS_VT_STYLES.map((name) => (
                <button
                  key={name}
                  type="button"
                  data-test={`canvas-style-${name}`}
                  className={`btn btn-sm ${style === name ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setStyle(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-xs text-base-content/50">
              Active: <span className="font-mono">{style}</span>
            </p>
          </>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
