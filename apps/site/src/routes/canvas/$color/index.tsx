import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/$color/")({
  pendingComponent: () => null,
  component: RouteComponent,
});

function RouteComponent() {
  const { color } = Route.useParams()

  return (
    <div
      data-test="canvas-detail"
      className="relative flex min-h-screen items-center justify-center bg-base-100 text-base-content"
    >
      <Link
        to="/canvas"
        search={{ vt: color }}
        viewTransition
        className="absolute top-6 left-6 text-sm text-primary hover:underline"
        data-test="canvas-back"
      >
        Back
      </Link>
      <div className="flex gap-4">
      <div
        className="size-60 rounded-2xl"
        style={{
          backgroundColor: color,
          viewTransitionName: `color-${color}`,
        }}
      />
      <div className="size-60 rounded-2xl text-5xl flex items-center justify-center">
        This box has the color {color}
      </div>
      </div>
    </div>
  );
}
