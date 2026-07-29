import { ViewTransition } from "react";
import Link from "next/link";
import { CANVAS_COLORS, canvasColorVtName } from "./_utils/colors";

export default function CanvasPage() {
  return (
    <div
      data-test="canvas-list"
      className="flex min-h-screen items-center justify-center bg-base-100 text-base-content"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/60">Next.js · React ViewTransition</p>
        {CANVAS_COLORS.map((color) => (
          <Link
            key={color.name}
            href={`/canvas/${color.name}`}
            data-test={`canvas-swatch-${color.name}`}
          >
            <ViewTransition name={canvasColorVtName(color.name)} share="morph" default="none">
              <div className="size-20 rounded-2xl" style={{ backgroundColor: color.value }} />
            </ViewTransition>
          </Link>
        ))}
      </div>
    </div>
  );
}
