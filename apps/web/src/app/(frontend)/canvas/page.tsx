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
    <ViewTransition enter="canvas-vt" exit="none" default="none">
      <div data-test="canvas-list" className="flex flex-1 items-center justify-center">
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
      </div>
    </ViewTransition>
  );
}
