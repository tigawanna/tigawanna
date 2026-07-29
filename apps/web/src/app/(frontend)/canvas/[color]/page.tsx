import { ViewTransition } from "react";
import Link from "next/link";
import { CANVAS_COLORS, canvasColorValue, canvasColorVtName } from "../_utils/colors";

export function generateStaticParams() {
  return CANVAS_COLORS.map((color) => ({ color: color.name }));
}

export default async function CanvasColorPage({ params }: { params: Promise<{ color: string }> }) {
  const { color } = await params;
  const value = canvasColorValue(color);

  return (
    <div
      data-test="canvas-detail"
      className="relative flex min-h-screen items-center justify-center bg-base-100 text-base-content"
    >
      <Link
        href="/canvas"
        className="absolute top-6 left-6 text-sm text-primary hover:underline"
        data-test="canvas-back"
      >
        Back
      </Link>
      <ViewTransition name={canvasColorVtName(color)} share="morph" default="none">
        <div className="size-60 rounded-2xl" style={{ backgroundColor: value }} />
      </ViewTransition>
    </div>
  );
}
