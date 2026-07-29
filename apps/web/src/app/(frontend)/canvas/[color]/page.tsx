import { ViewTransition } from "react";
import Link from "next/link";

export function generateStaticParams() {
  return [{ color: "red" }, { color: "green" }, { color: "blue" }, { color: "yellow" }];
}

export default async function CanvasColorPage({ params }: { params: Promise<{ color: string }> }) {
  const { color } = await params;

  return (
    <ViewTransition enter="canvas-vt" exit="none" default="none">
      <div data-test="canvas-detail" className="relative flex flex-1 items-center justify-center">
        <Link
          href="/canvas"
          transitionTypes={["wipe-back"]}
          className="absolute top-0 left-6 text-sm text-primary hover:underline"
          data-test="canvas-back"
        >
          Back
        </Link>
        <div className="flex items-center gap-8">
          <div className="size-60 rounded-2xl" style={{ backgroundColor: color }} />
          <p className="max-w-md text-5xl font-bold capitalize">This box has the color {color}</p>
        </div>
      </div>
    </ViewTransition>
  );
}
