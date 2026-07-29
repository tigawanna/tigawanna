"use client";

import { useEffect, useState } from "react";
import { CANVAS_VT_STYLES, type CanvasVtStyle } from "./_utils/vt-styles";
import "./view-transition/index.css";

/**
 * Canvas shell with a style picker for comparing full-page view transitions.
 */
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<CanvasVtStyle>("wipe");

  useEffect(() => {
    document.documentElement.dataset.style = style;
    return () => {
      delete document.documentElement.dataset.style;
    };
  }, [style]);

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content">
      <header className="flex flex-col items-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">Next.js · view transitions</h1>
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
          Active: <span className="font-mono">{style}</span> · React{" "}
          <span className="font-mono">&lt;ViewTransition&gt;</span>
        </p>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
