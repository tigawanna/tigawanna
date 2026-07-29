import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/canvas/")({
  validateSearch: z.object({
    vt: z.string().optional(),
  }),
  pendingComponent: () => null,
  component: RouteComponent,
});

function RouteComponent() {
  const { vt } = Route.useSearch();

  const colors = [
    { name: "red", value: "#FF0000" },
    { name: "green", value: "#00FF00" },
    { name: "blue", value: "#0000FF" },
    { name: "yellow", value: "#FFFF00" },
  ];

  return (
    <div
      data-test="canvas-list"
      className="flex min-h-screen items-center justify-center bg-base-100 text-base-content"
    >
      <div className="flex flex-col gap-4">
        {colors.map((color) => (
          <Link
            key={color.name}
            to="/canvas/$color"
            params={{ color: color.name }}
            viewTransition
            data-test={`canvas-swatch-${color.name}`}
            onClick={(event) => {
              const target = event.currentTarget.querySelector<HTMLElement>("[data-vt-target]");
              if (!target) return;

              document.querySelectorAll<HTMLElement>("[data-vt-target]").forEach((node) => {
                node.style.viewTransitionName = "none";
              });
              target.style.viewTransitionName = `color-${color.name}`;
            }}
          >
            <div
              data-vt-target
              className="size-20 rounded-2xl"
              style={{
                backgroundColor: color.value,
                viewTransitionName: vt === color.name ? `color-${color.name}` : undefined,
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
