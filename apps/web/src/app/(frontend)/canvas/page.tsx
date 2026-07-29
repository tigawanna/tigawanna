import { ViewTransition } from "react";
import Link from "next/link";

export default function CanvasPage() {
  const colors = [
    { name: "red", value: "#FF0000" },
    { name: "green", value: "#00FF00" },
    { name: "blue", value: "#0000FF" },
    { name: "yellow", value: "#FFFF00" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-10 p-6">
      <ViewTransition enter="canvas-vt" exit="none" default="none">
        <section className="flex w-full flex-col items-center gap-4" data-test="canvas-list">
          <h2 className="text-lg font-semibold">View transitions</h2>
          <div className="flex flex-col gap-4">
            {colors.map((color) => (
              <Link
                key={color.name}
                href={`/canvas/${color.name}`}
                transitionTypes={["wipe-forward"]}
                data-test={`canvas-swatch-${color.name}`}
              >
                <div className="size-20 rounded-2xl" style={{ backgroundColor: color.value }} />
              </Link>
            ))}
          </div>
        </section>
      </ViewTransition>

      <section className="flex w-full flex-col gap-3 border-t border-base-content/10 pt-8">
        <h2 className="text-lg font-semibold">Suspense / search-param demos</h2>
        <Link
          href="/canvas/suspense"
          className="rounded-2xl border border-base-content/10 px-4 py-3 hover:bg-base-200"
          data-test="demo-link-suspense"
        >
          <span className="font-medium">useTransition + Suspense</span>
          <span className="mt-1 block text-sm text-base-content/60">
            Toggle startTransition to see / hide the fallback flash
          </span>
        </Link>
      </section>
    </div>
  );
}
