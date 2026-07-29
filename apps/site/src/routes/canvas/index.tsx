import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/")({
  pendingComponent: () => null,
  component: RouteComponent,
});

function RouteComponent() {
  const colors = [
    { name: "red", value: "#FF0000" },
    { name: "green", value: "#00FF00" },
    { name: "blue", value: "#0000FF" },
    { name: "yellow", value: "#FFFF00" },
  ];

  return (
    <div data-test="canvas-list" className="flex flex-1 items-center justify-center">
      <div className="flex flex-col gap-4">
        {colors.map((color) => (
          <Link
            key={color.name}
            to="/canvas/$color"
            params={{ color: color.name }}
            viewTransition={{ types: ["wipe-forward"] }}
            data-test={`canvas-swatch-${color.name}`}
          >
            <div className="size-20 rounded-2xl" style={{ backgroundColor: color.value }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
